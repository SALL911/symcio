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

  if (status === "success") {
    return (
      <div className="border border-accent bg-accent/10 p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          已收到
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          掃描排程中，30 秒內寄出報告。
        </h3>
        <p className="mt-3 text-sm text-white/70">
          請檢查信箱（含垃圾信夾）。沒收到請來信 info@symcio.tw。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3">
        <label className="block">
          <span className="text-xs text-white/60">品牌名稱 *</span>
          <input
            name="brand_name"
            required
            placeholder="Symcio"
            className="mt-1 block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/60">品牌網域（選）</span>
          <input
            name="brand_domain"
            placeholder="symcio.tw"
            className="mt-1 block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/60">產業</span>
          <select
            name="industry"
            defaultValue="technology"
            className="mt-1 block w-full border border-white/20 bg-ink px-4 py-3 text-white focus:border-accent focus:outline-none"
          >
            <option value="technology">Technology / SaaS</option>
            <option value="finance">Finance / Fintech</option>
            <option value="consumer_goods">Consumer Goods</option>
            <option value="default">其他 / Other</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-white/60">公司名稱（選）</span>
          <input
            name="company"
            placeholder="Symcio Inc."
            className="mt-1 block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/60">Email *</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="mt-1 block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-accent px-6 py-4 text-base font-semibold text-ink hover:bg-accent/90 disabled:opacity-50"
      >
        {status === "submitting" ? "送出中..." : "免費掃描我的品牌 →"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-300">錯誤：{error}</p>
      )}

      <p className="text-xs text-white/40">
        送出即表示同意 Symcio 將你的 email 用於寄送掃描報告。我們不轉售名單。
      </p>
    </form>
  );
}
