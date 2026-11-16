import { NextResponse } from "next/server";
import { getEcpayConfig, isEcpaySandbox, verifyCheckMacValue } from "@/lib/ecpay/client";
import { sendPurchase } from "@/lib/meta/conversions";
import { send as sendEmail, renderEbookDelivery } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ECPay server-to-server payment notification (ReturnURL). Must reply exactly
// "1|OK" once handled, otherwise ECPay keeps retrying.
export async function POST(req: Request): Promise<Response> {
  const config = getEcpayConfig();

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

    // 回傳購買事件給 Meta 廣告。模擬付款（SimulatePaid=1）與測試特店不算真實成交，
    // 除非設定了 META_CAPI_TEST_EVENT_CODE（事件只進「測試事件」分頁）。
    const isRealPayment = params.SimulatePaid !== "1" && !isEcpaySandbox();
    if (isRealPayment || process.env.META_CAPI_TEST_EVENT_CODE?.trim()) {
      const site = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";
      const result = await sendPurchase({
        orderId: params.MerchantTradeNo,
        value: Number(params.TradeAmt),
        currency: "TWD",
        email: email || undefined,
        fbp: params.CustomField3 || undefined,
        contentName: product || undefined,
        eventSourceUrl: `${site}/checkout/success`,
      });
      if (result.error) console.error("[ecpay] meta purchase event failed:", result.error);
    }
  }

  // Always ack so ECPay stops retrying; failed payments are simply not fulfilled.
  return new NextResponse("1|OK", { status: 200 });
}
