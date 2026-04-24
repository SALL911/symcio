import type { Metadata } from "next";
import Link from "next/link";
import { TypeformEmbed } from "@/components/TypeformEmbed";

export const metadata: Metadata = {
  title: "免費品牌 AI 健檢 | Symcio BrandOS",
  description:
    "30 秒看見你的品牌在 ChatGPT、Claude、Gemini、Perplexity 四引擎的真實曝光。填品牌名與 email，報告直接寄到你的信箱。",
};

export default function BrandCheckPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-mono text-sm font-medium no-underline">
            Symcio
          </Link>
          <nav className="flex gap-5 text-sm text-muted">
            <a href="/faq/" className="hover:text-accent no-underline">FAQ</a>
            <Link href="/pricing" className="hover:text-accent no-underline">定價</Link>
            <Link href="/about" className="hover:text-accent no-underline">關於</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Free Scan · 免費品牌 AI 健檢
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            30 秒看見你的品牌<br />在 AI 引擎的真實位置。
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            四個引擎、一個 prompt、一封信。完全免費，不需要信用卡，不會轉售你的名單。
          </p>

          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
                健檢流程
              </h2>
              <ol className="mt-4 space-y-4 text-sm text-muted">
                <li className="flex gap-3">
                  <span className="font-mono text-accent">01</span>
                  <span>填入品牌名稱、網域、email（右側表單）</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-accent">02</span>
                  <span>Symcio 啟動 ChatGPT / Claude / Gemini / Perplexity 四引擎</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-accent">03</span>
                  <span>解析每個引擎的提及率、排名、競品、情感</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-accent">04</span>
                  <span>ABVI 綜合分數報告寄到你的 email（約 30 秒內）</span>
                </li>
              </ol>

              <div className="mt-10 border-l-2 border-accent bg-surface p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  想要完整版？
                </p>
                <p className="mt-2 text-sm text-muted">
                  $299 AI Visibility Audit 解鎖 20 prompt × 4 引擎、競品雷達圖、
                  3 項可執行改善建議 PDF，24 小時內交付。
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-block font-mono text-xs text-accent no-underline"
                >
                  查看定價 →
                </Link>
              </div>
            </div>

            <div className="border border-line bg-surface p-6">
              <TypeformEmbed />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
