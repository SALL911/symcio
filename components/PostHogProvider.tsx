"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ensurePostHog, posthog } from "@/lib/posthog/client";

/**
 * PostHog 載入。
 *
 * 放在 layout.tsx 包 {children}，所有頁面自動追蹤。
 * 不提供 React context — Experiment hook 直接讀 posthog 單例即可。
 *
 * 注意：此元件不可呼叫 useSearchParams()。useSearchParams 會讓外層 Suspense
 * 在 build 時 bailout 成 client-side rendering，整站 HTML 變成空殼，
 * GPTBot / ClaudeBot / PerplexityBot 等不執行 JS 的爬蟲將讀不到任何內容。
 * pageview 追蹤拆到 <PostHogPageView />，以獨立 Suspense 包住。
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensurePostHog();
  }, []);

  return <>{children}</>;
}

/** App Router 的 client-side navigation 不會觸發 pageview，手動補。 */
export function PostHogPageView() {
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
