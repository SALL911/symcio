/**
 * PostHog 客戶端初始化 + GA4 bridge。
 *
 * WHY
 *   PostHog 負責實驗邏輯 + 產品分析；GA4 仍是行銷團隊主要儀表板。
 *   bridge 讓每個實驗曝光也送一份到 GA4 dataLayer，雙邊都有同樣事件可 segment。
 *
 * 只在 browser 初始化（PostHog 本身就是 client-only，不要在 server import 它）。
 */
"use client";

import posthog, { PostHog } from "posthog-js";

let initialized = false;

export function ensurePostHog(): PostHog | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key) {
    // Dev 或 env var 缺失時降級：回 null，Experiment component 會 fallback 到預設變體。
    if (process.env.NODE_ENV === "development") {
      console.info("[posthog] NEXT_PUBLIC_POSTHOG_KEY not set; experiments use defaults.");
    }
    return null;
  }

  if (!initialized) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      disable_session_recording: false,
      loaded: (ph) => {
        // 在 flag 載入完成後才開放實驗讀取；Experiment component 會先渲染預設，
        // flag 進來後再 rerender。這個 loaded 只用來做第一次 bridge。
        try {
          ph.onFeatureFlags(() => {
            // noop；Experiment hook 自己處理重算
          });
        } catch {
          /* ignore */
        }
      },
    });
    initialized = true;
  }

  return posthog;
}

/**
 * 送實驗曝光事件到 GA4（layout.tsx 已經載入 gtag），同時也送一份到 PostHog。
 * 兩邊都能看到「某 distinct_id 在某實驗被分到哪個變體」。
 */
export function trackExperimentExposure(experimentKey: string, variant: string): void {
  if (typeof window === "undefined") return;

  // GA4 bridge：用 custom event，行銷團隊在 GA4 Explore 可以做分群
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    try {
      gtag("event", "experiment_impression", {
        experiment_key: experimentKey,
        variant,
      });
    } catch {
      /* ignore */
    }
  }

  // PostHog native event（產品團隊在 PostHog Insights 用）
  const ph = initialized ? posthog : null;
  if (ph) {
    try {
      ph.capture("$feature_flag_called", {
        $feature_flag: experimentKey,
        $feature_flag_response: variant,
      });
    } catch {
      /* ignore */
    }
  }
}

/**
 * 轉換事件：實驗完成條件。兩邊都送。
 * 例：trackConversion("primary_cta_click", { cta: "free_scan" })
 */
export function trackConversion(name: string, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    try {
      gtag("event", name, props);
    } catch {
      /* ignore */
    }
  }

  if (initialized) {
    try {
      posthog.capture(name, props);
    } catch {
      /* ignore */
    }
  }
}

export { posthog };
