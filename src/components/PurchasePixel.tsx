"use client";

import { useEffect } from "react";
import { fbqTrack } from "@/brandos/meta/pixel";

/**
 * 付款成功頁送 Meta Purchase（瀏覽器端）。
 * eventId 與 Stripe webhook 送的 Conversions API 事件相同，Meta 端會去重。
 * 用 sessionStorage 確保重新整理不會重送。
 */
export function PurchasePixel(props: { eventId: string; value: number; currency: string; product: string }) {
  useEffect(() => {
    const key = `symcio_purchase_${props.eventId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage 不可用時仍送一次 */
    }
    // Pixel script 是 afterInteractive 載入，稍等一下確保 fbq 已就緒
    const t = setTimeout(() => {
      fbqTrack(
        "Purchase",
        { value: props.value, currency: props.currency, content_name: props.product },
        false,
        props.eventId,
      );
    }, 800);
    return () => clearTimeout(t);
  }, [props.eventId, props.value, props.currency, props.product]);
  return null;
}
