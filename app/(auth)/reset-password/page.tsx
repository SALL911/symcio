"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Password reset landing.
 *
 * Supabase's resetPasswordForEmail() sends a magic-link style recovery email.
 * When the user clicks it, they arrive here with an active recovery session
 * already attached (via URL fragment handled by supabase-js). We just need
 * to prompt for a new password and call updateUser().
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) setReady(!!session);
        if (!session) {
          setError(
            "未偵測到重設 session。請從信件內的重設連結重新點擊進入此頁。",
          );
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "session 讀取失敗");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("密碼至少 8 個字元。");
      return;
    }
    if (password !== confirm) {
      setError("兩次密碼輸入不一致。");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => router.push("/member"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "重設失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-line bg-surface p-8 md:p-10">
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
          重設密碼
        </h1>

        {!ready && !error && (
          <p className="mt-4 text-sm text-muted">驗證重設連結中…</p>
        )}

        {done ? (
          <div className="mt-6 rounded-lg border border-excellent/40 bg-excellent/10 px-4 py-4 text-sm text-excellent">
            ✓ 密碼已更新。2 秒後自動導向會員中心…
          </div>
        ) : (
          ready && (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted">
                  新密碼
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="至少 8 個字元"
                  className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted">
                  再次確認
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-card bg-accent px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "更新中…" : "更新密碼 →"}
              </button>
            </form>
          )
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        回到{" "}
        <Link href="/login" className="text-accent no-underline">
          登入
        </Link>
      </p>
    </div>
  );
}
