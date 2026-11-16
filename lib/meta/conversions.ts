import crypto from "crypto";

/**
 * Meta Conversions API — 伺服器端回傳購買事件。
 *
 * WHY
 *   綠界付款成功是由綠界伺服器通知我們（ReturnURL），瀏覽器端的返回頁不是付款證明，
 *   ATM / 超商代碼更是離開網站後才繳費。只有在伺服器端回傳，Meta 廣告才看得到真實成交。
 *
 * 設定（缺任一項即不送出，不影響付款流程）
 *   NEXT_PUBLIC_META_PIXEL_ID   與瀏覽器端 Pixel 相同
 *   META_CAPI_ACCESS_TOKEN      事件管理工具 → 設定 → 轉換 API → 產生存取權杖
 *   META_CAPI_TEST_EVENT_CODE   選填；填入後事件只出現在「測試事件」分頁，不計入正式數據
 *
 * 個資：email 以 SHA-256 雜湊後才送出，Meta 收不到明文。
 */

const GRAPH_BASE = (process.env.META_GRAPH_API_BASE || "https://graph.facebook.com").replace(/\/$/, "");
const API_VERSION = "v21.0";
const PIXEL_ID_RE = /^\d{6,20}$/;

export interface PurchaseInput {
  /** 訂單編號；同時作為 event_id，重複通知時由 Meta 去重 */
  orderId: string;
  value: number;
  currency: string;
  email?: string;
  /** 瀏覽器 _fbp cookie，提高事件比對率 */
  fbp?: string;
  contentName?: string;
  eventSourceUrl?: string;
  /** 付款完成時間（秒）；預設為現在 */
  eventTime?: number;
}

export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function buildPurchaseEvent(input: PurchaseInput): Record<string, unknown> {
  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [hashEmail(input.email)];
  if (input.fbp) userData.fbp = input.fbp;
  return {
    event_name: "Purchase",
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.orderId,
    action_source: "website",
    ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
    user_data: userData,
    custom_data: {
      currency: input.currency,
      value: input.value,
      order_id: input.orderId,
      ...(input.contentName ? { content_name: input.contentName } : {}),
    },
  };
}

export function isCapiConfigured(): boolean {
  return (
    PIXEL_ID_RE.test(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "") &&
    Boolean(process.env.META_CAPI_ACCESS_TOKEN?.trim())
  );
}

/** 永不 throw：追蹤失敗不得讓付款回呼失敗。 */
export async function sendPurchase(
  input: PurchaseInput,
): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  if (!isCapiConfigured()) return { ok: false, skipped: "meta-capi-not-configured" };
  // 沒有任何可比對的使用者資料時 Meta 會拒收，直接略過
  if (!input.email && !input.fbp) return { ok: false, skipped: "no-user-data" };
  if (!Number.isFinite(input.value) || input.value <= 0) return { ok: false, skipped: "invalid-value" };

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID!.trim();
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  const body = {
    data: [buildPurchaseEvent(input)],
    ...(testCode ? { test_event_code: testCode } : {}),
  };
  try {
    const resp = await fetch(`${GRAPH_BASE}/${API_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.META_CAPI_ACCESS_TOKEN!.trim()}`,
      },
      body: JSON.stringify(body),
      // 綠界等待回應有時限，追蹤請求不可拖住 "1|OK"
      signal: AbortSignal.timeout(4000),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { ok: false, error: `meta-capi HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
