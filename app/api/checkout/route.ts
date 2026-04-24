import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, STRIPE_PRODUCTS, type StripeProduct } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

const QuerySchema = z.object({
  product: z.enum(["audit", "optimization"] as const).default("audit"),
  email: z.string().email().optional(),
  brand: z.string().trim().max(200).optional(),
});

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
  const priceId = params.product === "audit"
    ? process.env.STRIPE_AUDIT_PRICE_ID
    : process.env.STRIPE_OPTIMIZATION_PRICE_ID;

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
  const { url, error } = await createSession(parsed.data);
  if (!url) {
    return NextResponse.json({ ok: false, error }, { status: 503 });
  }
  return NextResponse.json({ ok: true, url });
}
