import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "付款成功 — Symcio AI Visibility Audit",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccess() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-2xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Symcio · AI Visibility Intelligence
        </p>
        <h1 className="mt-3 text-4xl font-semibold">付款成功。</h1>
        <p className="mt-6 text-lg text-muted">
          我們已收到你的訂單。Symcio 團隊會在 <strong className="text-ink">24 小時內</strong>
          交付完整的 AI Visibility Audit（20 prompts × 4 engines + 競品對比 + 改善建議 PDF）。
        </p>
        <div className="mt-10 border-l-4 border-accent bg-gray-50 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            接下來會發生什麼
          </p>
          <ol className="mt-3 space-y-2 text-sm text-ink">
            <li>1. Stripe 寄出收據到你的 email（幾分鐘內）。</li>
            <li>2. Symcio 啟動四引擎測試（ChatGPT / Claude / Gemini / Perplexity）。</li>
            <li>3. 24 小時內，完整報告 PDF 與 Calendly 連結會寄到你的 email。</li>
            <li>4. 如 48 小時仍未收到，來信 <a href="mailto:info@symcio.tw" className="underline">info@symcio.tw</a> 我們親自處理。</li>
          </ol>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block border border-ink px-4 py-2 text-sm no-underline hover:bg-ink hover:text-white"
          >
            ← 回到 symcio.tw
          </Link>
        </div>
      </section>
    </main>
  );
}
