import { NextResponse } from "next/server";
import { isEcpaySandbox } from "@/lib/ecpay/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/readiness — reports which integrations are configured for cash-flow
// launch. Returns booleans and short hints only; never the secret values.
export async function GET(): Promise<Response> {
  const has = (name: string) => Boolean(process.env[name]?.trim());
  const mode = (name: string) => process.env[name]?.trim() || null;

  const checks = {
    ebook: {
      pdfUrl: has("BCI_EBOOK_DOWNLOAD_URL"),
      siteUrl: has("NEXT_PUBLIC_SITE_URL"),
    },
    resend: {
      apiKey: has("RESEND_API_KEY"),
      fromAddress: has("RESEND_FROM_ADDRESS"),
    },
    stripe: {
      paymentLink: has("STRIPE_EBOOK_PAYMENT_LINK"),
      secretKey: has("STRIPE_SECRET_KEY"),
      webhookSecret: has("STRIPE_WEBHOOK_SECRET"),
    },
    ecpay: {
      mode: mode("ECPAY_MODE") || "stage",
      merchantId: has("ECPAY_MERCHANT_ID"),
      hashKey: has("ECPAY_HASH_KEY"),
      hashIv: has("ECPAY_HASH_IV"),
      usingSandbox: isEcpaySandbox(),
    },
    paypal: {
      mode: mode("PAYPAL_MODE"),
      clientId: has("PAYPAL_CLIENT_ID"),
      secret: has("PAYPAL_SECRET"),
    },
    telegram: {
      botToken: has("TELEGRAM_BOT_TOKEN"),
      webhookSecret: has("TELEGRAM_WEBHOOK_SECRET"),
    },
    line: {
      channelSecret: has("LINE_CHANNEL_SECRET"),
      accessToken: has("LINE_CHANNEL_ACCESS_TOKEN"),
    },
    meta: {
      appSecret: has("META_APP_SECRET"),
      pageToken: has("META_PAGE_ACCESS_TOKEN"),
      verifyToken: has("META_VERIFY_TOKEN"),
    },
    stores: {
      pubu: has("NEXT_PUBLIC_EBOOK_PUBU_URL"),
      readmoo: has("NEXT_PUBLIC_EBOOK_READMOO_URL"),
    },
    kit: {
      apiKey: has("KIT_API_KEY"),
      formId: has("KIT_FORM_ID"),
    },
    leads: {
      supabase: has("SUPABASE_URL") && has("SUPABASE_SERVICE_ROLE_KEY"),
      notifyEmail: has("RESEND_API_KEY"),
    },
    metaAds: {
      pixel: true,
      capiToken: has("META_CAPI_ACCESS_TOKEN"),
    },
  };

  const allOf = (obj: Record<string, unknown>) =>
    Object.values(obj).every((v) => (typeof v === "boolean" ? v : Boolean(v)));

  const ready = {
    ebookDelivery: checks.ebook.pdfUrl && checks.resend.apiKey && checks.resend.fromAddress,
    stripe: allOf(checks.stripe),
    // ECPay works out of the box with the public sandbox credentials, so the
    // gateway is always "ready" to accept test payments. usingSandbox tells
    // the operator whether real money will land vs test-mode only.
    ecpay: true,
    paypal: allOf(checks.paypal),
    telegram: allOf(checks.telegram),
    line: allOf(checks.line),
    meta: allOf(checks.meta),
    kit: checks.kit.apiKey,
  };

  const anyPaymentReady = ready.stripe || ready.ecpay || ready.paypal;
  // canTakeMoney：付款 → 交付的管線接得通（含測試模式）。CI 用這個值。
  const canTakeMoney = anyPaymentReady && ready.ebookDelivery;

  // canTakeRealMoney：真的有一條金流在正式模式，客人付的錢會入帳。
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  const stripeLive =
    (stripeKey.startsWith("sk_live_") || stripeKey.startsWith("rk_live_")) &&
    checks.stripe.webhookSecret;
  const ecpayLive = !checks.ecpay.usingSandbox;
  const paypalLive = ready.paypal && checks.paypal.mode === "live";
  const canTakeRealMoney = (stripeLive || ecpayLive || paypalLive) && ready.ebookDelivery;
  // canCaptureLeads：名單至少有一個地方落地（資料庫或通知信）。
  const canCaptureLeads = checks.leads.supabase || checks.leads.notifyEmail;

  // 依離現金遠近排序的待辦：每一條都是「在 Vercel 設哪個環境變數」。
  const blockers: string[] = [];
  if (!stripeLive && !ecpayLive && !paypalLive) {
    blockers.push(
      "收不到真錢：Stripe 是測試金鑰或缺 STRIPE_WEBHOOK_SECRET，綠界是沙盒。擇一上線：STRIPE_SECRET_KEY(sk_live_) + STRIPE_WEBHOOK_SECRET，或 ECPAY_MODE=prod + ECPAY_MERCHANT_ID / ECPAY_HASH_KEY / ECPAY_HASH_IV",
    );
  }
  if (!checks.stripe.webhookSecret) {
    blockers.push("Stripe 付款後不會自動交付：缺 STRIPE_WEBHOOK_SECRET（webhook 指向 /api/webhooks/stripe）");
  }
  if (!ready.ebookDelivery) {
    blockers.push("電子書無法自動交付：缺 BCI_EBOOK_DOWNLOAD_URL / RESEND_API_KEY / RESEND_FROM_ADDRESS");
  }
  if (!checks.leads.supabase) {
    blockers.push(
      "名單沒有進資料庫：缺 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（目前只靠通知信保存）",
    );
  }
  if (!checks.metaAds.capiToken) blockers.push("Meta 轉換 API 未啟用：缺 META_CAPI_ACCESS_TOKEN");
  if (!ready.line) blockers.push("LINE 自動回覆未啟用：缺 LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN");
  if (!ready.meta) blockers.push("Messenger / IG 自動回覆未啟用：缺 META_APP_SECRET / META_PAGE_ACCESS_TOKEN / META_VERIFY_TOKEN");
  if (!ready.telegram) blockers.push("Telegram 自動回覆未啟用：缺 TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET");
  if (!ready.kit) blockers.push("電子報名單未同步 Kit：缺 KIT_API_KEY");

  return NextResponse.json(
    { canTakeMoney, canTakeRealMoney, canCaptureLeads, blockers, ready, checks },
    { headers: { "cache-control": "no-store" } },
  );
}
