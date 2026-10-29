import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { adminClient } from "@/lib/supabase/admin";
import { decodeEmail, verify } from "@/lib/newsletter/token";
import { confirmPending } from "@/lib/newsletter/subscribers";
import { syncMember } from "@/lib/sync/member";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "確認訂閱 — Symcio 週報", robots: { index: false } };

// Double opt-in：匯入的聯絡人點擊邀請信中的確認連結後，才轉為 active。

async function apply(e?: string, t?: string): Promise<"ok" | "noop" | "invalid" | "error"> {
  const email = decodeEmail(e ?? "");
  if (!email || !verify("confirm", email, t ?? "")) return "invalid";
  const sb = adminClient();
  if (!sb) return "error";
  const { data, error } = await confirmPending(sb, email);
  if (error) return "error";
  if (!data?.length) return "noop";
  await syncMember(
    { email, source: "import", newsletterOptIn: true, createdAt: new Date().toISOString() },
    ["hubspot", "notion"],
  );
  return "ok";
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { e?: string; t?: string };
}) {
  const result = await apply(searchParams.e, searchParams.t);
  const title = {
    ok: "訂閱完成",
    noop: "此信箱已處理過",
    invalid: "連結無效",
    error: "暫時無法處理",
  }[result];
  const body = {
    ok: "每週二上午 9 點，你會收到一封 Symcio 週報。每封信底部都有一鍵退訂。",
    noop: "此信箱已是訂閱狀態，或先前已退訂。若要重新訂閱，請到電子報頁面填寫信箱。",
    invalid: "請確認連結完整，或到電子報頁面直接訂閱。",
    error: "請稍後再試，或來信 info@symcio.tw。",
  }[result];
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">{body}</p>
        <Link href="/news" className="mt-8 inline-block text-sm text-accent">
          前往電子報頁面 →
        </Link>
      </main>
      <Footer />
    </>
  );
}
