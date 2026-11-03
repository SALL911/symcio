import { NextResponse } from "next/server";
import { getPaypalConfig, captureOrder } from "@/lib/paypal/client";
import { send as sendEmail, renderEbookDelivery } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

// PayPal return_url. PayPal appends ?token=<orderId> after buyer approval; we
// capture the payment, deliver the ebook, then redirect to the success page.
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("token");
  if (!orderId) {
    return NextResponse.redirect(`${ORIGIN}/checkout/cancel`, { status: 303 });
  }

  const config = getPaypalConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: "paypal-not-configured" }, { status: 503 });
  }

  const result = await captureOrder(config, orderId);
  if (!result.completed) {
    return NextResponse.redirect(`${ORIGIN}/checkout/cancel`, { status: 303 });
  }

  const fileUrl = process.env.BCI_EBOOK_DOWNLOAD_URL?.trim();
  if (result.product === "ebook" && result.email && fileUrl) {
    const from = process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";
    const { subject, html } = renderEbookDelivery({ customerEmail: result.email, downloadUrl: fileUrl });
    await sendEmail({ from, to: result.email, subject, html, replyTo: "info@symcio.tw" });
  }

  return NextResponse.redirect(`${ORIGIN}/checkout/success?product=ebook&gw=paypal`, { status: 303 });
}
