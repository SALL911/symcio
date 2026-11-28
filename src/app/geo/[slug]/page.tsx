import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { createClient } from "@/brandos/geo/client";
import { renderGeoMarkdown } from "@/brandos/geo/render";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";
export const revalidate = 600;

interface GeoDetail {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  content_type: string | null;
  target_queries: string[] | null;
  platforms: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const SITE = "https://symcio.tw";

async function loadGeo(slug: string): Promise<GeoDetail | null> {
  try {
    const sb = createClient();
    const { data } = await sb
      .from("geo_content")
      .select(
        "id, slug, title, content, content_type, target_queries, platforms, published_at, created_at, updated_at",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data as GeoDetail | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await loadGeo(params.slug);
  if (!item) return { title: "內容不存在 — Symcio" };
  const title = item.title ?? item.slug;
  const description = stripMd(item.content).slice(0, 160);
  return {
    title: `${title} — Symcio GEO`,
    description,
    openGraph: {
      title,
      description: stripMd(item.content).slice(0, 200),
      type: "article",
      url: `${SITE}/geo/${item.slug}`,
    },
    alternates: {
      canonical: `${SITE}/geo/${item.slug}`,
    },
  };
}

export default async function GeoDetailPage({ params }: Props) {
  const item = await loadGeo(params.slug);
  if (!item) notFound();

  const html = await renderGeoMarkdown(item.content);
  const title = item.title ?? item.slug;
  const date = formatDate(item.published_at ?? item.created_at);

  // schema.org Article — 給 ChatGPT / Perplexity / Google 等 crawler 結構化資料
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: item.published_at ?? item.created_at,
    dateModified: item.updated_at,
    author: { "@type": "Organization", name: "Symcio" },
    publisher: {
      "@type": "Organization",
      name: "Symcio",
      url: SITE,
    },
    url: `${SITE}/geo/${item.slug}`,
    keywords: (item.target_queries ?? []).join(", "),
    articleSection: item.content_type ?? "GEO Content",
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <nav className="mb-8">
          <Link
            href="/geo"
            className="font-mono text-xs text-muted hover:text-accent no-underline"
          >
            ← 所有 GEO 內容
          </Link>
        </nav>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {item.content_type && (
            <span className="rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-accent">
              {item.content_type}
            </span>
          )}
          {date && (
            <span className="font-mono text-[11px] text-muted-dim">{date}</span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
          {title}
        </h1>

        <div
          className="prose prose-invert mt-10 max-w-none text-base leading-[1.85]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {item.target_queries && item.target_queries.length > 0 && (
          <section className="mt-12 rounded-card border border-line bg-surface p-5">
            <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[2px] text-accent">
              Target Queries
            </h2>
            <p className="mb-3 text-xs text-muted">
              本文針對以下 AI 搜尋引擎詢問優化：
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.target_queries.map((q) => (
                <span
                  key={q}
                  className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {q}
                </span>
              ))}
            </div>
          </section>
        )}

        {item.platforms && item.platforms.length > 0 && (
          <section className="mt-6 rounded-card border border-line bg-surface p-5">
            <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[2px] text-accent">
              發布通路
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {item.platforms.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 grid gap-3 md:grid-cols-2">
          <Link
            href="/audit"
            className="group rounded-card border border-line bg-surface p-5 no-underline transition hover:border-accent"
          >
            <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-accent">
              想測自己的 AI 可見度？
            </div>
            <div className="mt-2 font-bold text-ink">免費 Brand AI Audit</div>
            <div className="mt-2 font-mono text-xs text-accent">3 分鐘 →</div>
          </Link>
          <Link
            href="/news"
            className="group rounded-card border border-line bg-surface p-5 no-underline transition hover:border-accent"
          >
            <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-accent">
              延伸閱讀
            </div>
            <div className="mt-2 font-bold text-ink">每日 ESG 新聞</div>
            <div className="mt-2 font-mono text-xs text-accent">BCI 視角 →</div>
          </Link>
        </section>
      </article>

      <Footer />
    </main>
  );
}

function stripMd(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
