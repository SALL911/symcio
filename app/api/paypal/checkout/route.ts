import { NextResponse } from "next/server";
import { getPaypalConfig, createOrder, PAYPAL_PRODUCTS, type PaypalProduct } from "@/lib/paypal/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

export async function GET(req: Request): Promise<Response> {
  const product = new URL(req.url).searchParams.get("product") || "ebook";
  if (!(product in PAYPAL_PRODUCTS)) {
    return NextResponse.json({ ok: false, error: "invalid-product" }, { status: 400 });
  }

  const config = getPaypalConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: "paypal-not-configured" }, { status: 503 });
  }

  const { approveUrl, error } = await createOrder({
    config,
    product: product as PaypalProduct,
    origin: ORIGIN,
  });
  if (!approveUrl) {
    return NextResponse.json({ ok: false, error }, { status: 503 });
  }
  return NextResponse.redirect(approveUrl, { status: 303 });
}
