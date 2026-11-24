import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 結帳漏斗設定健康檢查：只回報各設定是否存在（true/false），絕不回傳任何值。
 * 用於除錯「付款後沒收到確認信」：Stripe → webhook → Supabase → Resend → 預約連結。
 */

const FROM_ADDRESS = () => process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";

function fromDomain(): string | null {
  const match = FROM_ADDRESS().match(/@([^>\s]+)/);
  return match ? match[1].toLowerCase() : null;
}

/** 查詢寄件網域在 Resend 是否已驗證；金鑰權限不足時回報 unknown。 */
async function resendDomainStatus(): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  const domain = fromDomain();
  if (!key) return "no-api-key";
  if (!domain) return "invalid-from-address";
  try {
    const resp = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (resp.status === 401 || resp.status === 403) return "unknown (sending-only key)";
    if (!resp.ok) return `error HTTP ${resp.status}`;
    const data = (await resp.json()) as { data?: { name: string; status: string }[] };
    const match = data.data?.find((d) => d.name.toLowerCase() === domain);
    return match ? match.status : "not-added";
  } catch {
    return "unreachable";
  }
}

export async function GET(): Promise<Response> {
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  return NextResponse.json({
    site_origin: siteOrigin(),
    stripe: {
      secret_key: Boolean(stripeKey),
      mode: stripeKey.startsWith("sk_live_") || stripeKey.startsWith("rk_live_")
        ? "live"
        : stripeKey ? "test" : "missing",
      webhook_secret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      webhook_endpoint: `${siteOrigin()}/api/webhooks/stripe`,
    },
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    resend: {
      api_key: Boolean(process.env.RESEND_API_KEY),
      from_domain: fromDomain(),
      domain_status: await resendDomainStatus(),
    },
    kit_upgrade_booking_url: Boolean(process.env.KIT_UPGRADE_BOOKING_URL),
  });
}
