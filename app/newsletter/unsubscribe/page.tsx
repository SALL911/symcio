import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { adminClient } from "@/lib/supabase/admin";
import { decodeEmail, verify } from "@/lib/newsletter/token";
import { unsubscribe } from "@/lib/newsletter/subscribers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "取消訂閱 — Symcio 週報", robots: { index: false } };

// 個資法 §20 第 3 項：一鍵退訂，開啟連結即生效，不要求登入或填表。
// token 為 HMAC 簽章，無法由 email 推得；robots noindex 降低爬蟲誤觸。

async function apply(e?: string, t?: string): Promise<"ok" | "invalid" | "error"> {
  const email = decodeEmail(e ?? "");
  if (!email || !verify("unsubscribe", email, t ?? "")) return "invalid";
  const sb = adminClient();
  if (!sb) return "error";
  const { error } = await unsubscribe(sb, email);
  return error ? "error" : "ok";
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { e?: string; t?: string };
}) {
  const result = await apply(searchParams.e, searchParams.t);
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">
          {result === "ok" ? "已取消訂閱" : result === "invalid" ? "連結無效或已過期" : "暫時無法處理"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {result === "ok"
            ? "你將不再收到 Symcio 週報。若是誤按，可隨時到電子報頁面重新訂閱。"
            : "請直接回覆任何一封 Symcio 來信，或寫信至 info@symcio.tw，我們會在 2 個工作天內為你處理。"}
        </p>
        <Link href="/news" className="mt-8 inline-block text-sm text-accent">
          前往電子報頁面 →
        </Link>
      </main>
      <Footer />
    </>
  );
}
