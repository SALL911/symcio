"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ensurePostHog, posthog } from "@/lib/posthog/client";

/**
 * PostHog 載入 + route change page view。
 *
 * 放在 layout.tsx 當作 {children} 的「兄弟節點」，外層包 <Suspense>。
 * 不可以用它包住 {children}：useSearchParams 會讓整棵子樹退回 client-side rendering，
 * 結果是所有頁面的 HTML 沒有內容，搜尋引擎與 AI 爬蟲讀不到。
 * 不提供 React context — Experiment hook 直接讀 posthog 單例即可。
 */
export function PostHogProvider() {
  useEffect(() => {
    ensurePostHog();
  }, []);

  // App Router 的 client-side navigation 不會觸發 pageview，手動補
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    try {
      posthog.capture("$pageview", { $current_url: url });
    } catch {
      /* ignore — PostHog 未初始化 */
    }
  }, [pathname, searchParams]);

  return null;
}
