"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error || "訂閱失敗,請稍後再試。");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "已收到你的訂閱,下次發報會寄到你的信箱。");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("網路錯誤,請稍後再試。");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="newsletter-email" className="block text-sm font-medium text-ink">
        訂閱 Symcio 每週電子報
      </label>
      <p className="text-xs text-muted">
        每週一封,AI 整理的 ESG / SDG 重點 + Symcio Brand Capital 解讀。可隨時退訂。
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={status === "submitting"}
          className="flex-1 rounded-card border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted-dim focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-accent-dim disabled:opacity-60"
        >
          {status === "submitting" ? "送出中…" : "訂閱"}
        </button>
      </div>
      {status === "success" && (
        <p className="text-xs text-accent">{message}</p>
      )}
      {status === "error" && (
        <p className="text-xs text-rose-600">{message}</p>
      )}
    </form>
  );
}
