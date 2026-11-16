import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { formatGeoDate, getGeoArticle } from "@/lib/geo/data";
import { renderGeoMarkdown, stripMarkdown } from "@/lib/geo/render";

interface Props {
  params: { slug: string };
}

const SITE = "https://symcio.tw";

export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getGeoArticle(params.slug);
  if (!item) return { title: "找不到文章 — Symcio", robots: { index: false } };
  const title = item.title ?? item.slug;
  const description = stripMarkdown(item.content).slice(0, 160);
  return {
    title: `${title} — Symcio`,
    description,
    openGraph: { title, description, type: "article", url: `${SITE}/geo/${item.slug}` },
    alternates: { canonical: `${SITE}/geo/${item.slug}` },
  };
}

export default async function GeoArticlePage({ params }: Props) {
  const item = await getGeoArticle(params.slug);
  if (!item) notFound();

  const html = await renderGeoMarkdown(item.content);
  const title = item.title ?? item.slug;
  const date = formatGeoDate(item.published_at ?? item.created_at);

  // schema.org Article：讓搜尋引擎與 AI 引擎能辨識作者、日期與主題
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: item.published_at ?? item.created_at,
    dateModified: item.updated_at,
    inLanguage: "zh-Hant",
    author: { "@type": "Organization", name: "Symcio", url: SITE },
    publisher: { "@type": "Organization", name: "Symcio", url: SITE },
    mainEntityOfPage: `${SITE}/geo/${item.slug}`,
    keywords: (item.target_queries ?? []).join(", "),
    articleSection: item.content_type ?? undefined,
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        // JSON 內的 "<" 一律轉義，避免內容中的 </script> 提前結束標籤
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navigation />

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <Link href="/geo" className="font-mono text-xs text-muted no-underline hover:text-accent">
          ← 所有文章
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {item.content_type && (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-accent">
              {item.content_type}
            </span>
          )}
          {date && <span className="font-mono text-[11px] text-muted-dim">{date}</span>}
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">{title}</h1>

        <div className="geo-body mt-10" dangerouslySetInnerHTML={{ __html: html }} />

        {item.target_queries && item.target_queries.length > 0 && (
          <section className="mt-12 rounded-card border border-line bg-surface p-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[2px] text-accent">
              這篇文章回答的問題
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {item.target_queries.map((q) => (
                <li key={q}>· {q}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 rounded-card border border-accent bg-accent-soft p-6">
          <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-accent">
            下一步
          </div>
          <p className="mt-2 text-lg font-bold text-ink">
            3 分鐘看見 AI 怎麼描述你的品牌
          </p>
          <Link
            href="/audit"
            className="mt-4 inline-block rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
          >
            免費 Brand AI Audit →
          </Link>
        </section>
      </article>

      <Footer />
    </main>
  );
}
