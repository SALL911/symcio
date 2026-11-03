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
  const canTakeMoney = anyPaymentReady && ready.ebookDelivery;

  return NextResponse.json(
    { canTakeMoney, ready, checks },
    { headers: { "cache-control": "no-store" } },
  );
}
