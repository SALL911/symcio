"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID, fbqTrack } from "@/brandos/meta/pixel";

/**
 * Meta Pixel — 在 app layout 掛一次。
 *
 * 首次載入的 PageView 由 init script 送出；App Router 的 client-side 換頁
 * 不會重新執行 script，所以用 pathname 變化補送 PageView。
 */
export function MetaPixel() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    fbqTrack("PageView");
  }, [pathname]);

  // 結帳連結是伺服器轉址（/api/*/checkout），為了不拖慢轉址速度，
  // InitiateCheckout 在點擊當下由瀏覽器送出。
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") || "";
      const m = href.match(/^\/api\/(?:(ecpay|paypal)\/)?checkout\?(.*)$/);
      if (!m) return;
      const product = new URLSearchParams(m[2]).get("product") || "audit";
      fbqTrack("InitiateCheckout", { content_name: product, payment_gateway: m[1] || "stripe" });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
    </Script>
  );
}
