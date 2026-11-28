"use client";

import { FormEvent, useState } from "react";
import { getAttribution } from "@/lib/utm/capture";
import { fbqTrack } from "@/brandos/meta/pixel";

type Status = "idle" | "sending" | "done" | "error";

const FIELD =
  "mt-1 w-full rounded-card border border-line bg-bg px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none";

/** /service 的導入諮詢表單：送到 /api/service-leads，成功後送 Lead 事件。 */
export function ServiceLeadForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (status === "sending") return;
    const data = new FormData(ev.currentTarget);
    const metaEventId =
      globalThis.crypto?.randomUUID?.() ??
      `svc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setStatus("sending");
    try {
      const res = await fetch("/api/service-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          company: data.get("company"),
          email: data.get("email"),
          need: data.get("need") || "",
          website_url: data.get("website_url") || "",
          attribution: getAttribution(),
          meta_event_id: metaEventId,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      fbqTrack("Lead", { content_name: "service_consult" }, false, metaEventId);
      try {
        const g = (globalThis as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
        if (typeof g === "function") g("event", "service_lead_submit");
      } catch {
        /* ignore */
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-card border border-accent bg-surface-2 p-6" role="status">
        <h3 className="text-lg font-semibold text-ink">已收到你的諮詢需求</h3>
        <p className="mt-2 text-sm text-muted">
          我們會在 1 個工作天內用 email 回覆。想先看結果，可以現在做 3 分鐘免費診斷。
        </p>
        <a
          href="/audit"
          className="mt-4 inline-block rounded-card bg-accent px-6 py-3 text-base font-semibold text-white no-underline hover:bg-accent-dim"
        >
          開始免費診斷 →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-card border border-line bg-surface-2 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-muted">
          姓名
          <input name="name" required maxLength={100} autoComplete="name" className={FIELD} />
        </label>
        <label className="block text-sm text-muted">
          公司 / 品牌
          <input name="company" required maxLength={200} autoComplete="organization" className={FIELD} />
        </label>
      </div>
      <label className="block text-sm text-muted">
        Email
        <input name="email" type="email" required maxLength={254} autoComplete="email" className={FIELD} />
      </label>
      <label className="block text-sm text-muted">
        想解決的問題（選填）
        <textarea
          name="need"
          rows={3}
          maxLength={1000}
          placeholder="例：有流量但名單少、想讓私訊自動導到付款頁"
          className={FIELD}
        />
      </label>
      {/* 蜜罐欄位：對真人隱藏 */}
      <input
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-card bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dim disabled:opacity-60"
      >
        {status === "sending" ? "送出中…" : "送出諮詢需求 →"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          送出失敗，請稍後再試，或直接寄信到 info@symcio.tw。
        </p>
      )}
      <p className="text-xs text-muted">
        送出即表示同意我們以 email 與你聯絡。資料只用於回覆這次諮詢。
      </p>
    </form>
  );
}
