import { NextResponse } from "next/server";
import { getEcpayConfig, isEcpaySandbox, verifyCheckMacValue } from "@/lib/payments/ecpay/client";
import { send as sendEmail, renderEbookDelivery } from "@/brandos/email/resend";
import { leadsSupabase } from "@/lib/leads/capture";
import { sendCapiEvent } from "@/brandos/meta/capi";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

/**
 * 正式環境的綠界付款成功 → 寫入 orders（新台幣）+ Meta Purchase。
 * 沙盒金鑰是公開的，任何人都能偽造通知，所以沙盒模式完全不入帳、不送轉換。
 * 這裡任何失敗都只記 log：交付電子書與回覆 1|OK 不能被記帳拖累。
 */
async function recordPaidOrder(params: Record<string, string>): Promise<void> {
  const tradeNo = params.MerchantTradeNo || "";
  const amount = Number(params.TradeAmt || 0);
  const product = params.CustomField1 || "ebook";
  const email = params.CustomField2 || "";
  if (!tradeNo || !(amount > 0)) return;

  const sb = leadsSupabase();
  if (sb) {
    try {
      // 綠界會重送通知，用金流訂單編號避免重複入帳
      const { data: dup, error: dupErr } = await sb
        .from("orders")
        .select("id")
        .eq("provider", "ecpay")
        .eq("provider_ref", tradeNo)
        .limit(1);
      if (dupErr) {
        console.error("[ecpay] orders lookup failed（migration 20261124 是否已套用？）", dupErr.message);
      } else if (!dup || dup.length === 0) {
        const { error } = await sb.from("orders").insert({
          product,
          price: amount,
          currency: "TWD",
          provider: "ecpay",
          provider_ref: tradeNo,
          customer_email: email || null,
          payment_status: "paid",
          delivery_status: product === "ebook" ? "delivered" : "pending",
        });
        if (error) console.error("[ecpay] orders insert failed", error.message);
        if (email) await sb.from("leads").update({ status: "converted" }).eq("email", email);
      }
    } catch (err) {
      console.error("[ecpay] record order failed", err);
    }
  }

  await sendCapiEvent(null, {
    eventName: "Purchase",
    eventId: tradeNo,
    email: email || undefined,
    sourceUrl: `${ORIGIN}/checkout/success`,
    customData: { value: amount, currency: "TWD", content_name: product },
  });
}

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
    // 沙盒金鑰是綠界公開文件上的值，任何人都能偽造簽章。
    // 沙盒模式下只交付給自家網域（CI 驗證用），避免電子書被免費領走。
    const deliverable = !isEcpaySandbox() || /@symcio\.tw$/i.test(email || "");
    if (product === "ebook" && email && fileUrl && deliverable) {
      const from = process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";
      const { subject, html } = renderEbookDelivery({ customerEmail: email, downloadUrl: fileUrl });
      await sendEmail({ from, to: email, subject, html, replyTo: "info@symcio.tw" });
    }
    // 先交付、後記帳：記帳與轉換事件失敗不能影響客戶拿到商品
    if (!isEcpaySandbox()) await recordPaidOrder(params);
  }

  // Always ack so ECPay stops retrying; failed payments are simply not fulfilled.
  return new NextResponse("1|OK", { status: 200 });
}
