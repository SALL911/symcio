import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, STRIPE_PRODUCTS, type StripeProduct } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

const QuerySchema = z.object({
  product: z.enum(["audit", "optimization", "ebook"] as const).default("audit"),
  email: z.string().email().optional(),
  brand: z.string().trim().max(200).optional(),
});

const PAYMENT_LINK_ENV: Record<StripeProduct, string> = {
  audit: "STRIPE_AUDIT_PAYMENT_LINK",
  optimization: "STRIPE_OPTIMIZATION_PAYMENT_LINK",
  ebook: "STRIPE_EBOOK_PAYMENT_LINK",
};

const PRICE_ID_ENV: Record<StripeProduct, string> = {
  audit: "STRIPE_AUDIT_PRICE_ID",
  optimization: "STRIPE_OPTIMIZATION_PRICE_ID",
  ebook: "STRIPE_EBOOK_PRICE_ID",
};

// Fast path: a Stripe Payment Link is a pre-created static buy.stripe.com URL.
// Redirecting to it needs zero Stripe API calls, so the checkout response stays
// well under 0.2s instead of waiting on a server-side sessions.create roundtrip.
function paymentLinkFor(product: StripeProduct): string | undefined {
  const raw = process.env[PAYMENT_LINK_ENV[product]];
  const trimmed = raw?.trim();
  return trimmed && /^https:\/\//i.test(trimmed) ? trimmed : undefined;
}

function buildPaymentLinkUrl(params: {
  product: StripeProduct;
  email?: string;
  brand?: string;
}): string | undefined {
  const base = paymentLinkFor(params.product);
  if (!base) return undefined;
  const link = new URL(base);
  if (params.email) link.searchParams.set("prefilled_email", params.email);
  // Stripe restricts client_reference_id to [A-Za-z0-9_-], max 200 chars.
  const ref = params.brand?.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 200);
  if (ref) link.searchParams.set("client_reference_id", ref);
  return link.toString();
}

async function createSession(params: {
  product: StripeProduct;
  email?: string;
  brand?: string;
}): Promise<{ url: string | null; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { url: null, error: "stripe-not-configured" };
  }

  const product = STRIPE_PRODUCTS[params.product];
  const priceId = process.env[PRICE_ID_ENV[params.product]];

  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 as const }]
    : [{
        quantity: 1 as const,
        price_data: {
          currency: product.currency,
          unit_amount: product.amount,
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
      }];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ORIGIN}/checkout/cancel`,
      customer_email: params.email,
      allow_promotion_codes: true,
      metadata: {
        product: params.product,
        brand: params.brand || "",
        source: "symcio.tw",
      },
      payment_intent_data: {
        metadata: {
          product: params.product,
          brand: params.brand || "",
        },
      },
    });
    return { url: session.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { url: null, error: `stripe: ${msg}` };
  }
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    product: url.searchParams.get("product") || "audit",
    email: url.searchParams.get("email") || undefined,
    brand: url.searchParams.get("brand") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid-params" }, { status: 400 });
  }
  const fastUrl = buildPaymentLinkUrl(parsed.data);
  if (fastUrl) {
    return NextResponse.redirect(fastUrl, { status: 303 });
  }
  const { url: checkoutUrl, error } = await createSession(parsed.data);
  if (!checkoutUrl) {
    return NextResponse.json({ ok: false, error }, { status: 503 });
  }
  return NextResponse.redirect(checkoutUrl, { status: 303 });
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
  const parsed = QuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid-body" }, { status: 400 });
  }
  const fastUrl = buildPaymentLinkUrl(parsed.data);
  if (fastUrl) {
    return NextResponse.json({ ok: true, url: fastUrl });
  }
  const { url, error } = await createSession(parsed.data);
  if (!url) {
    return NextResponse.json({ ok: false, error }, { status: 503 });
  }
  return NextResponse.json({ ok: true, url });
}
