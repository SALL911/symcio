import { createHash } from "crypto";
import { META_PIXEL_ID } from "./pixel";

// Meta Conversions API（server-side）。
// 與瀏覽器 Pixel 搭配：同一事件帶相同 event_id，Meta 端自動去重。
// 未設定 META_CAPI_ACCESS_TOKEN 時整段 no-op，不影響既有流程。

const GRAPH_VERSION = "v21.0";

function sha256(v: string): string {
  return createHash("sha256").update(v).digest("hex");
}

function cookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export type CapiEvent = {
  eventName: string;
  eventId?: string;
  email?: string;
  fbclid?: string;
  customData?: Record<string, unknown>;
};

/** 送一筆事件到 Conversions API。回傳是否送出成功；任何錯誤都吞掉只記 log。 */
export async function sendCapiEvent(req: Request, ev: CapiEvent): Promise<boolean> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return false;

  const h = req.headers;
  const cookies = h.get("cookie");
  const now = Math.floor(Date.now() / 1000);
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;

  // fbc：優先用瀏覽器 cookie；沒有就用 first-touch 的 fbclid 依 Meta 規格組出來
  const fbc =
    cookie(cookies, "_fbc") || (ev.fbclid ? `fb.1.${now * 1000}.${ev.fbclid}` : undefined);

  const user_data: Record<string, unknown> = {
    client_ip_address: ip,
    client_user_agent: h.get("user-agent") || undefined,
    fbp: cookie(cookies, "_fbp"),
    fbc,
  };
  // email 一律正規化後 SHA-256，明文不離開本服務
  if (ev.email) user_data.em = [sha256(ev.email.trim().toLowerCase())];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: ev.eventName,
        event_time: now,
        event_id: ev.eventId,
        action_source: "website",
        event_source_url: h.get("referer") || undefined,
        user_data,
        custom_data: ev.customData,
      },
    ],
  };
  // Events Manager「測試事件」分頁的代碼；正式環境不要設
  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) {
      console.error("[meta/capi] non-2xx", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[meta/capi] send failed", err);
    return false;
  }
}
