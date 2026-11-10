"use client";

import { useEffect, useRef } from "react";

// Symcio 品牌治理雙週刊 — HubSpot 表單（訂閱者直接進 HubSpot）
// 舊的 /api/newsletter/subscribe 保留給既有名單，不再從前端呼叫。
const PORTAL_ID = "244117180";
const FORM_ID = "dedb5e0d-6df9-4f57-a2e9-b237c50db615";
const REGION = "na2";
const EMBED_SRC = `https://js-${REGION}.hsforms.net/forms/embed/${PORTAL_ID}.js`;

export function NewsletterSignup() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // 每次掛載都重新載入嵌入程式，確保站內換頁後表單也會出現
    host.innerHTML = "";
    const frame = document.createElement("div");
    frame.className = "hs-form-frame";
    frame.dataset.region = REGION;
    frame.dataset.formId = FORM_ID;
    frame.dataset.portalId = PORTAL_ID;
    host.appendChild(frame);

    const script = document.createElement("script");
    script.src = EMBED_SRC;
    script.defer = true;
    host.appendChild(script);

    return () => {
      host.innerHTML = "";
    };
  }, []);

  return (
    <div className="space-y-3">
      <p className="block text-sm font-medium text-ink">訂閱 Symcio 品牌治理雙週刊</p>
      <p className="text-xs text-muted">
        每兩週一封,整理 AI 搜尋、ESG 與外銷合規的變化,附一個當天就能做的動作。可隨時退訂。
      </p>
      <div ref={ref} />
      <p className="text-xs text-muted">
        也可以到 <a href="/subscribe" className="text-accent">訂閱頁</a> 查看雙週刊內容。
      </p>
    </div>
  );
}
