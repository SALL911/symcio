import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { NewsletterToggle } from "@/components/member/NewsletterToggle";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { SOCIAL_LINKS } from "@/lib/social";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "會員中心 — Symcio", robots: { index: false } };

export default async function MemberPage() {
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    // Supabase 未設定（例如 preview 環境）：導回登入頁，由登入表單顯示設定錯誤
    redirect("/login?next=/member");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/member");

  const { data: member } = await supabase
    .from("members")
    .select("display_name, company_name, plan, monthly_audit_quota, audits_used_this_month, created_at")
    .eq("id", user.id)
    .maybeSingle();

  // 訂閱狀態以 newsletter_subscribers 為準（RLS 對 client 全封鎖，改走 service role）
  const { data: sub } = (await adminClient()
    ?.from("newsletter_subscribers")
    .select("status")
    .eq("email", (user.email ?? "").toLowerCase())
    .maybeSingle()) ?? { data: null };

  const name = member?.display_name || user.email?.split("@")[0];

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Member</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{name}，歡迎回來</h1>
        <p className="mt-2 text-sm text-muted">{user.email}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">帳號</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">公司 / 品牌</dt><dd className="text-ink">{member?.company_name || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">方案</dt><dd className="text-ink">{member?.plan || "free"}</dd></div>
              <div className="flex justify-between">
                <dt className="text-muted">本月診斷額度</dt>
                <dd className="text-ink">{member ? `${member.audits_used_this_month ?? 0} / ${member.monthly_audit_quota ?? 3}` : "—"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/audit" className="rounded-card bg-accent px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-accent-dim">
                開始品牌 AI 診斷
              </Link>
              <Link href="/pricing" className="rounded-card border border-line px-4 py-2 text-sm text-ink no-underline hover:border-accent">
                升級方案
              </Link>
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">Symcio 週報</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              每週二 09:00 寄出，整理 AI 搜尋能見度、品牌治理與 ESG 揭露重點。
            </p>
            <div className="mt-4">
              <NewsletterToggle initial={sub?.status === "active"} />
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-ink">官方社群</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-card border border-line px-4 py-2 text-sm text-ink no-underline hover:border-accent"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </section>
        </div>

        <form action="/auth/logout" method="post" className="mt-10">
          <button type="submit" className="text-sm text-muted hover:text-accent">登出</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
