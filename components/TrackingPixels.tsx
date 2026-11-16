"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LINE_TAG_ID, META_PIXEL_ID } from "@/lib/tracking/events";

type Fn = (...args: unknown[]) => void;

/**
 * Meta Pixel + LINE Tag 基本碼。
 *
 * ID 由環境變數提供（NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_LINE_TAG_ID），
 * 未設定就完全不載入對應 script。
 *
 * Next.js App Router 換頁不會重新載入 script，基本碼只會送出第一次 PageView，
 * 因此這裡監聽 pathname，換頁時補送 PageView / pv，站內瀏覽深度才不會被低估。
 */
export function TrackingPixels() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false; // 首次 PageView 已由基本碼送出
      return;
    }
    const w = window as unknown as { fbq?: Fn; _lt?: Fn };
    try {
      if (META_PIXEL_ID) w.fbq?.("track", "PageView");
      if (LINE_TAG_ID) w._lt?.("send", "pv", [LINE_TAG_ID]);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return (
    <>
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
      {LINE_TAG_ID && (
        <>
          <Script id="line-tag" strategy="afterInteractive">
            {`(function(g,d,o){g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
var h=location.protocol==='https:'?'https://d.line-scdn.net':'http://d.line-cdn.net';
var s=d.createElement('script');s.async=1;s.src=o||h+'/n/line_tag/public/release/v1/lt.js';
var t=d.getElementsByTagName('script')[0];t.parentNode.insertBefore(s,t);})(window,document);
_lt('init',{customerType:'lap',tagId:'${LINE_TAG_ID}'});_lt('send','pv',['${LINE_TAG_ID}']);`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://tr.line.me/tag.gif?c_t=lap&t_id=${LINE_TAG_ID}&e=pv&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}

/** 掛在伺服器元件頁面（如付款成功頁）上，進頁時送出一次轉換事件。 */
export function AdConversion({
  event,
  props,
  dedupeKey,
}: {
  event: "Lead" | "Purchase";
  props?: Record<string, unknown>;
  /** 同一筆交易重新整理頁面時不重複計算轉換 */
  dedupeKey?: string;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (dedupeKey) {
      try {
        const k = `symcio_cv_${dedupeKey}`;
        if (sessionStorage.getItem(k)) return;
        sessionStorage.setItem(k, "1");
      } catch {
        /* storage 不可用時照常送出 */
      }
    }
    // 基本碼為 afterInteractive，稍候再送，確保 fbq / _lt 佇列已建立
    const t = setTimeout(() => {
      import("@/lib/tracking/events").then((m) => m.trackAdEvent(event, props ?? {}));
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
