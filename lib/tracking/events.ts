/**
 * 廣告／分析事件統一出口：GA4 + PostHog + Meta Pixel + LINE Tag。
 *
 * WHY
 *   各表單原本各自呼叫 gtag；加上 Meta Pixel 與 LINE Tag 後若每處都寫三份，
 *   事件名稱很快會不一致，廣告後台的轉換數就無法與 GA4 對帳。
 *
 * 事件對照
 *   Lead      表單送出（免費掃描 / Audit / 電子報）
 *   Contact   點擊社群連結（LINE 加好友等）
 *   Purchase  付款完成
 *
 * LINE Tag：Purchase 送預設的 Conversion；Lead / Contact 以同名自訂事件送出，
 *   需先在 LINE Ads Manager →「追蹤 (LINE Tag)」→「自訂事件」建立名稱 Lead、Contact。
 */
"use client";

export type AdEvent = "Lead" | "Contact" | "Purchase";

type Fn = (...args: unknown[]) => void;
interface TrackingWindow {
  gtag?: Fn;
  fbq?: Fn;
  _lt?: Fn;
  posthog?: { capture?: (name: string, props?: Record<string, unknown>) => void };
}

const ID_RE = /^[A-Za-z0-9-]{6,64}$/;

/** 只接受英數與連字號，避免 env 值被拼進 inline script 時造成注入。 */
export function safeTagId(raw: string | undefined): string | null {
  const v = raw?.trim();
  return v && ID_RE.test(v) ? v : null;
}

export const META_PIXEL_ID = safeTagId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
export const LINE_TAG_ID = safeTagId(process.env.NEXT_PUBLIC_LINE_TAG_ID);

const GA_NAME: Record<AdEvent, string> = {
  Lead: "generate_lead",
  Contact: "social_click",
  Purchase: "purchase",
};

export function trackAdEvent(event: AdEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as TrackingWindow;
  const safely = (fn: () => void) => {
    try {
      fn();
    } catch {
      /* 追蹤失敗不得影響使用者流程 */
    }
  };

  safely(() => w.gtag?.("event", GA_NAME[event], props));
  safely(() => w.posthog?.capture?.(GA_NAME[event], props));
  if (META_PIXEL_ID) safely(() => w.fbq?.("track", event, props));
  if (LINE_TAG_ID) {
    const type = event === "Purchase" ? "Conversion" : event;
    safely(() => w._lt?.("send", "cv", { type }, [LINE_TAG_ID]));
  }
}
