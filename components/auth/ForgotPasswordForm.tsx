"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "寄送失敗";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-line bg-surface p-8 md:p-10">
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
          忘記密碼
        </h1>
        <p className="mt-2 text-sm text-muted">
          輸入註冊時的 email，我們會寄送密碼重設連結。
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-excellent/40 bg-excellent/10 px-4 py-4 text-sm text-excellent">
            ✓ 已寄送密碼重設信到 <b>{email}</b>。請查看信箱（含垃圾信夾），
            點擊連結完成重設。連結 1 小時內有效。
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-card bg-accent px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "寄送中…" : "寄送重設連結 →"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        想起來了？{" "}
        <Link href="/login" className="text-accent no-underline">
          回到登入
        </Link>
      </p>
    </div>
  );
}
