import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gated download for the BCI ebook. Re-verifies the Stripe Checkout Session is
// paid and for the ebook product on every click, so the real file URL never
// ships in HTML and the link can't be shared to non-buyers.
export async function GET(req: Request): Promise<Response> {
  const fileUrl = process.env.BCI_EBOOK_DOWNLOAD_URL?.trim();
  if (!fileUrl || !/^https?:\/\//i.test(fileUrl)) {
    return NextResponse.json({ ok: false, error: "ebook-file-not-configured" }, { status: 503 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing-session" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "stripe-not-configured" }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const isEbook = session.metadata?.product === "ebook";
    if (!paid || !isEbook) {
      return NextResponse.json({ ok: false, error: "not-entitled" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-session" }, { status: 403 });
  }

  return NextResponse.redirect(fileUrl, { status: 302 });
}
