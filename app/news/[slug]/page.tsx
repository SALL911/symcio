import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NEWS_ENTRIES, findEntry } from "@/lib/news-data";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return NEWS_ENTRIES.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = findEntry(params.slug);
  if (!entry) return { title: "電子報 — Symcio" };
  return {
    title: `${entry.title} — Symcio Weekly`,
    description: entry.summary,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      type: "article",
      publishedTime: entry.publishedAt,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function NewsDetailPage({ params }: Props) {
  const entry = findEntry(params.slug);
  if (!entry) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.publishedAt,
    author: { "@type": "Organization", name: "Symcio · BrandOS" },
    publisher: { "@type": "Organization", name: "Symcio · BrandOS" },
    keywords: entry.categories.join(", "),
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Navigation />

      <article className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/news"
            className="font-mono text-xs uppercase tracking-widest text-muted no-underline hover:text-accent"
          >
            ← 回電子報列表
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted">
            <time dateTime={entry.publishedAt} className="font-mono">
              {formatDate(entry.publishedAt)}
            </time>
            {entry.categories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted"
              >
                {c}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            {entry.summary}
          </p>

          <div className="mt-12 space-y-12">
            {entry.sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-xl font-semibold text-ink md:text-2xl">
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-ink">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                {s.sources && s.sources.length > 0 && (
                  <ul className="mt-4 space-y-1 text-xs text-muted">
                    {s.sources.map((src, k) => (
                      <li key={k}>
                        參考:
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-accent"
                        >
                          {src.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-card border-l-2 border-accent bg-surface p-6">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              Brand Capital 解讀
            </div>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-ink">
              {entry.brandCapitalTake.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-card border border-line bg-surface p-6">
            <NewsletterSignup />
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
