import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/client";
import { fireRepositoryDispatch } from "@/lib/github/dispatch";
import { send as sendEmail, renderAuditConfirmation } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook handler.
 *
 * Signature verification REQUIRES the raw request body (not JSON-parsed).
 * Next.js App Router provides the raw text via req.text() — that's the path
 * we use.
 *
 * Events handled:
 *   - checkout.session.completed → insert order to Supabase `orders`
 *
 * Future events (left as TODO for Phase 2):
 *   - invoice.payment_succeeded (for subscriptions)
 *   - payment_intent.payment_failed (retry logic)
 */

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<{ ok: boolean; error?: string; warnings: string[] }> {
  const warnings: string[] = [];
  const sb = supabaseAdmin();

  const metadata = session.metadata ?? {};
  const email = session.customer_email ?? session.customer_details?.email ?? null;
  const amountTotal = session.amount_total ?? 0;
  const priceUsd = amountTotal / 100;
  const product: "audit" | "optimization" =
    metadata.product === "optimization" ? "optimization" : "audit";
  const brandName = metadata.brand || "Unknown";

  let orderId: string | null = null;
  let brandId: string | null = null;

  // 1. Supabase: persist order + update lead status.
  if (sb) {
    if (brandName && brandName !== "Unknown") {
      const { data } = await sb
        .from("brands")
        .select("id")
        .eq("name", brandName)
        .maybeSingle();
      brandId = data?.id ?? null;
    }

    const { data: inserted, error } = await sb
      .from("orders")
      .insert({
        brand_id: brandId,
        product,
        price: priceUsd,
        payment_status: "paid",
        delivery_status: "pending",
      })
      .select("id")
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message, warnings };
    }
    orderId = inserted?.id ?? null;

    if (email) {
      await sb
        .from("leads")
        .update({ status: "converted" })
        .eq("email", email);
    }
  } else {
    warnings.push("supabase-not-configured");
  }

  // 2. GitHub repository_dispatch → triggers geo-audit.yml to run real audit.
  const dispatchResp = await fireRepositoryDispatch({
    eventType: "paid-audit",
    clientPayload: {
      brand_name: brandName,
      brand_domain: metadata.brand_domain || "",
      brand_industry: metadata.brand_industry || "technology",
      product,
      order_id: orderId,
      customer_email: email,
      stripe_session_id: session.id,
    },
  });
  if (!dispatchResp.ok) warnings.push(`dispatch: ${dispatchResp.error}`);

  // 3. Confirmation email via Resend.
  if (email) {
    const from = process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";
    const { subject, html } = renderAuditConfirmation({
      brandName,
      customerEmail: email,
      product,
    });
    const emailResp = await sendEmail({
      from,
      to: email,
      subject,
      html,
      replyTo: "info@symcio.tw",
    });
    if (!emailResp.ok) warnings.push(`resend: ${emailResp.error}`);
  } else {
    warnings.push("no-customer-email");
  }

  return { ok: true, warnings };
}

export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json(
      { ok: false, error: "stripe-webhook-not-configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "missing-signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `signature-verification-failed: ${msg}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const result = await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      if (!result.ok) {
        console.error("[stripe-webhook] handler failed", result.error);
        // Return 500 so Stripe retries
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }
      if (result.warnings.length > 0) {
        console.warn("[stripe-webhook] partial success", result.warnings);
      }
      return NextResponse.json({
        ok: true,
        event: event.type,
        warnings: result.warnings,
      });
    }
    default:
      // Acknowledge all other events so Stripe doesn't retry them indefinitely
      return NextResponse.json({ ok: true, event: event.type, handled: false });
  }
}
