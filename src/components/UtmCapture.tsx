"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/utm/capture";

/**
 * 在 app layout 掛一次 — 任何頁面載入都會嘗試寫入 first-touch 歸因。
 *
 * 為什麼不在 PostHogProvider 裡做？PostHog 會自動把 UTM 當 event property 送，
 * 但不會幫你存 sessionStorage 讓 Supabase 側使用。兩條歸因鏈各自運作。
 */
export function UtmCapture() {
  useEffect(() => {
    const attribution = captureAttribution();
    if (Object.keys(attribution).length === 0) return;

    // 把 UTM 也當 PostHog person property，跨 session 保留
    try {
      const ph = (window as unknown as { posthog?: { people?: { set?: (p: Record<string, unknown>) => void } } }).posthog;
      ph?.people?.set?.(attribution as Record<string, unknown>);
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
