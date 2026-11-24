"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getAttribution } from "@/lib/utm/capture";

const KEY = "symcio_sid";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** 每次換頁送一筆 page_view 到 /api/track，供內部漏斗看板使用。後台頁面不計。 */
export function FunnelBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      const payload = JSON.stringify({
        event: "page_view",
        path: pathname,
        session_id: sessionId(),
        utm_source: getAttribution().utm_source,
      });
      // sendBeacon 以 text/plain 送出，不會觸發 CORS preflight，離開頁面時也送得出去
      if (!navigator.sendBeacon?.("/api/track", payload)) {
        void fetch("/api/track", { method: "POST", body: payload, keepalive: true });
      }
    } catch {
      /* ignore */
    }
  }, [pathname]);
  return null;
}
