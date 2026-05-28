import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { STRIPE_PRODUCTS } from "@/lib/stripe/client";

const PRICE_TWD = Math.round(STRIPE_PRODUCTS.ebook.amount / 100);

export const metadata: Metadata = {
  title: "BCI 品牌資本指數方法論 電子書 — Symcio",
  description:
    "Brand Capital Index (BCI) 完整方法論電子書。整合財務品牌價值、永續合規價值與 AI 可見度價值三大維度，付款後立即下載 PDF。",
};

const CHAPTERS = [
  "BCI 是什麼：為什麼 AI 時代品牌需要新的衡量座標",
  "三大維度拆解：FBV 財務品牌價值 / SCV 永續合規價值 / AIV AI 可見度價值",
  "AIV 計算：跨 ChatGPT / Perplexity / Google AI Overview / Claude 的加權提及率",
  "從分數到行動：GEO 內容策略與 Schema/Wikidata 基礎建設",
  "把品牌變成可入帳的無形資產：ISO 10668 精神之估值邏輯",
  "實作範本：30 天可見度提升檢核表與 prompt 清單",
];

const BENEFITS = [
  "一套可重複執行的品牌可見度衡量框架",
  "可直接套用的 prompt 與檢核清單",
  "GEO（生成式引擎最佳化）入門到實作",
  "終身存取 · 後續版本免費更新",
];

export default function EbookPage() {
  const buyHref = "/api/checkout?product=ebook" as Route;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "BCI 品牌資本指數方法論",
    author: { "@type": "Organization", name: "Symcio" },
    bookFormat: "https://schema.org/EBook",
    offers: {
      "@type": "Offer",
      price: PRICE_TWD,
      priceCurrency: "TWD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              eBook · 電子書
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              BCI 品牌資本指數
              <br />
              方法論電子書
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              把品牌在 AI 時代的可見度，變成一個可衡量、可提升、可入帳的指標。
              整合財務品牌價值（FBV）、永續合規價值（SCV）與 AI 可見度價值（AIV）三大維度的完整方法論。
            </p>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-card border border-line bg-surface-2 p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">NT${PRICE_TWD}</span>
                <span className="text-sm text-muted">一次付清 · 立即下載</span>
              </div>
              <Link
                href={buyHref}
                className="mt-4 inline-block w-full rounded-card bg-accent px-6 py-3 text-center text-base font-semibold text-white no-underline hover:bg-accent-dim"
              >
                立即購買並下載 →
              </Link>
              <p className="mt-3 text-xs text-muted">
                透過 Stripe 安全結帳。付款完成後立即取得 PDF 下載連結，並寄送到你的 email。
              </p>
            </div>
          </div>

          <div className="rounded-card border border-line bg-surface-2 p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              目錄 · Contents
            </p>
            <ol className="mt-4 space-y-3 text-sm text-ink">
              {CHAPTERS.map((c, i) => (
                <li key={c} className="flex gap-3">
                  <span className="font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold">這本電子書適合誰</h2>
          <p className="mt-4 text-muted">
            有外銷、有品牌、想在 AI 搜尋與生成引擎中被看見的中小企業主、行銷負責人，
            以及想把品牌可見度做成可量化資產的顧問與創業者。
          </p>
          <div className="mt-8">
            <Link
              href={buyHref}
              className="inline-block rounded-card bg-accent px-6 py-3 text-base font-semibold text-white no-underline hover:bg-accent-dim"
            >
              立即購買 NT${PRICE_TWD} →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
