import { NextResponse } from "next/server";
import { getEcpayConfig, verifyCheckMacValue } from "@/lib/ecpay/client";
import { send as sendEmail, renderEbookDelivery } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ECPay server-to-server payment notification (ReturnURL). Must reply exactly
// "1|OK" once handled, otherwise ECPay keeps retrying.
export async function POST(req: Request): Promise<Response> {
  const config = getEcpayConfig();
  if (!config) {
    return new NextResponse("0|ecpay-not-configured", { status: 503 });
  }

  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    params[k] = typeof v === "string" ? v : "";
  }

  if (!verifyCheckMacValue(params, config.hashKey, config.hashIV)) {
    return new NextResponse("0|CheckMacValue-failed", { status: 400 });
  }

  // RtnCode "1" = payment success.
  if (params.RtnCode === "1") {
    const product = params.CustomField1;
    const email = params.CustomField2;
    const fileUrl = process.env.BCI_EBOOK_DOWNLOAD_URL?.trim();
    if (product === "ebook" && email && fileUrl) {
      const from = process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";
      const { subject, html } = renderEbookDelivery({ customerEmail: email, downloadUrl: fileUrl });
      await sendEmail({ from, to: email, subject, html, replyTo: "info@symcio.tw" });
    }
  }

  // Always ack so ECPay stops retrying; failed payments are simply not fulfilled.
  return new NextResponse("1|OK", { status: 200 });
}
