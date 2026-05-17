"use client";

import { FormEvent, useState } from "react";
import { getAttribution } from "@/lib/utm/capture";

type Status = "idle" | "submitting" | "success" | "error";

export function FreeScanForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      brand_name: String(form.get("brand_name") || "").trim(),
      brand_domain: String(form.get("brand_domain") || "").trim(),
      industry: String(form.get("industry") || "technology"),
      email: String(form.get("email") || "").trim(),
      company: String(form.get("company") || "").trim(),
      attribution: getAttribution(),
    };

    if (!payload.brand_name || !payload.email) {
      setStatus("error");
      setError("請填寫品牌名稱與 email。");
      return;
    }

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "未知錯誤");
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-card border border-line bg-surface px-4 py-3 text-ink placeholder-muted-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";

  if (status === "success") {
    return (
      <div className="rounded-card border border-accent bg-accent-soft p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          已收到
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-ink">
          掃描排程中,30 秒內寄出報告。
        </h3>
        <p className="mt-3 text-sm text-muted">
          請檢查信箱（含垃圾信夾）。沒收到請來信 info@symcio.tw。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3">
        <label className="block">
          <span className="text-xs text-muted">品牌名稱 *</span>
          <input
            name="brand_name"
            required
            placeholder="Symcio"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">品牌網域（選）</span>
          <input
            name="brand_domain"
            placeholder="symcio.tw"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">產業</span>
          <select
            name="industry"
            defaultValue="technology"
            className={inputClass}
          >
            <option value="technology">Technology / SaaS</option>
            <option value="finance">Finance / Fintech</option>
            <option value="consumer_goods">Consumer Goods</option>
            <option value="default">其他 / Other</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted">公司名稱（選）</span>
          <input
            name="company"
            placeholder="Symcio Inc."
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Email *</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-card bg-accent px-6 py-4 text-base font-semibold text-white hover:bg-accent-dim disabled:opacity-50"
      >
        {status === "submitting" ? "送出中..." : "免費掃描我的品牌 →"}
      </button>

      {status === "error" && (
        <p className="text-sm text-danger">錯誤：{error}</p>
      )}

      <p className="text-xs text-muted-dim">
        送出即表示同意 Symcio 將你的 email 用於寄送掃描報告。我們不轉售名單。
      </p>
    </form>
  );
}
