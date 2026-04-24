"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ensurePostHog, posthog } from "@/lib/posthog/client";

/**
 * PostHog 載入 + route change page view。
 *
 * 放在 layout.tsx 包 {children}，所有頁面自動追蹤。
 * 不提供 React context — Experiment hook 直接讀 posthog 單例即可。
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
