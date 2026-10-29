"use client";

import { useState } from "react";

export function NewsletterToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/member/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: !on }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || "更新失敗");
      setOn(!on);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "更新失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`text-sm font-semibold ${on ? "text-excellent" : "text-muted"}`}>
        {on ? "已訂閱 Symcio 週報" : "未訂閱"}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="rounded-card border border-line px-4 py-2 text-sm text-ink hover:border-accent disabled:opacity-50"
      >
        {busy ? "處理中…" : on ? "取消訂閱" : "訂閱週報"}
      </button>
      {err && <span className="text-sm text-danger">{err}</span>}
    </div>
  );
}
