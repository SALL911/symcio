"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function LoginForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/member";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: {
              full_name: displayName || email.split("@")[0],
              company: company || undefined,
              newsletter_opt_in: newsletterOptIn,
            },
          },
        });
        if (err) throw err;
        setInfo(
          "註冊成功。我們寄了一封確認信到你的信箱，點擊連結後即可登入。",
        );
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        router.push(next);
        router.refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "登入 / 註冊失敗";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) throw err;
      // Browser will redirect to Google
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Google 登入失敗";
      setError(friendlyError(msg));
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-line bg-surface p-8 md:p-10">
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
          {mode === "signup" ? "建立 BrandOS 帳號" : "登入 BrandOS"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "signup"
            ? "免費建立帳號 — 診斷紀錄與電子報偏好集中管理。"
            : "查看你的 AI 能見度診斷紀錄、管理電子報訂閱。"}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-card border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />
          使用 Google {mode === "signup" ? "註冊" : "登入"}
        </button>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
            或
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="auth-display-name"
                className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted"
              >
                姓名
              </label>
              <input
                id="auth-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="你的名字"
                className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label
                htmlFor="auth-company"
                className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted"
              >
                公司 / 品牌（選填）
              </label>
              <input
                id="auth-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
                className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className="block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted"
              >
                密碼
              </label>
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="font-mono text-[11px] text-accent no-underline hover:underline"
                >
                  忘記密碼？
                </Link>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "至少 8 個字元" : ""}
              className="w-full rounded-lg border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {mode === "signup" && (
            <label className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={newsletterOptIn}
                onChange={(e) => setNewsletterOptIn(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#2A4D3A]"
              />
              <span>我同意每週收到 Symcio 週報（AI 能見度與品牌治理重點），可隨時一鍵退訂。</span>
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-lg border border-excellent/40 bg-excellent/10 px-4 py-3 text-sm text-excellent">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-accent px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "處理中…"
              : mode === "signup"
                ? "註冊 →"
                : "登入 →"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "signup" ? (
          <>
            已有帳號？{" "}
            <Link href="/login" className="text-accent no-underline">
              登入
            </Link>
          </>
        ) : (
          <>
            還沒有帳號？{" "}
            <Link href="/signup" className="text-accent no-underline">
              免費註冊
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email 或密碼錯誤。";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "此 Email 已註冊，請直接登入。";
  if (m.includes("email not confirmed"))
    return "Email 尚未確認，請查看信箱完成驗證。";
  if (m.includes("password should be at least"))
    return "密碼長度不足，至少 8 個字元。";
  if (m.includes("missing") && m.includes("supabase"))
    return "Supabase 尚未設定，聯絡管理員。";
  return msg;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
