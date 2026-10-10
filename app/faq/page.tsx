import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_CATEGORIES } from "@/lib/faq-data";
import { SITE_URL, breadcrumbSchema, pageMetadata } from "@/lib/seo";

const TOTAL = FAQ_CATEGORIES.reduce((n, c) => n + c.entries.length, 0);

export const metadata: Metadata = pageMetadata({
  title: "FAQ 知識庫 — AI 可見度、GEO、ESG 常見問答 | Symcio",
  description: `Symcio 知識庫收錄 ${TOTAL} 組常見問答，涵蓋 AI 可見度量化、GEO 與 SEO 差異、ESG / TNFD 揭露、資料安全與投資人問題，依角色分為 ${FAQ_CATEGORIES.length} 類。`,
  path: "/faq",
});

export default function FaqIndexPage() {
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/faq#collection`,
    name: "Symcio FAQ 知識庫",
    inLanguage: "zh-Hant",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    hasPart: FAQ_CATEGORIES.map((c) => ({
      "@type": "FAQPage",
      "@id": `${SITE_URL}/faq/${c.key}#faq`,
      name: `${c.label} FAQ`,
      url: `${SITE_URL}/faq/${c.key}`,
    })),
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <JsonLd data={[collection, breadcrumbSchema([["知識庫", "/faq"]])]} />

      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Symcio 知識庫
          </p>
          <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
            FAQ 知識庫
          </h1>
          <p className="mt-3 text-base text-muted md:text-lg">
            Symcio 是台灣的 AI Visibility Intelligence（AVI）平台，量化品牌在
            ChatGPT、Claude、Gemini、Perplexity 四大 AI 引擎中的曝光、排名與影響力。
            知識庫共 {TOTAL} 組問答，依讀者角色分為 {FAQ_CATEGORIES.length} 類。
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-4xl gap-4 px-6 py-12 md:grid-cols-2">
          {FAQ_CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/faq/${c.key}`}
              className="block rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent"
            >
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {c.audience}
              </div>
              <h2 className="mt-2 text-xl font-bold text-ink">
                {c.label} · {c.entries.length} 題
              </h2>
              <p className="mt-2 text-sm text-muted">{c.tagline}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {c.entries.slice(0, 3).map((e) => (
                  <li key={e.q}>· {e.q}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
