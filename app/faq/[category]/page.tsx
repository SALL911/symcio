import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQ_CATEGORIES, findCategory } from "@/lib/faq-data";

interface Props {
  params: { category: string };
}

export function generateStaticParams() {
  return FAQ_CATEGORIES.map((c) => ({ category: c.key }));
}

export function generateMetadata({ params }: Props): Metadata {
  const cat = findCategory(params.category);
  if (!cat) return { title: "知識庫 — Symcio" };
  return {
    title: `${cat.label} FAQ — Symcio 知識庫`,
    description: `${cat.tagline} · 10 組常見問答。Symcio BrandOS / BCI 方法論說明。`,
    openGraph: {
      title: `${cat.label} FAQ — Symcio`,
      description: cat.tagline,
      type: "article",
    },
  };
}

export default function FaqCategoryPage({ params }: Props) {
  const cat = findCategory(params.category);
  if (!cat) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cat.entries.map((e) => ({
      "@type": "Question",
      name: e.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.a,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-ink text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Symcio 知識庫 · {cat.audience}
          </p>
          <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
            {cat.label} 常見問答
          </h1>
          <p className="mt-3 text-base text-muted md:text-lg">{cat.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/faq/${c.key}`}
                className={`rounded-full border px-4 py-1.5 font-mono text-xs no-underline transition ${
                  c.key === cat.key
                    ? "border-accent bg-accent text-ink"
                    : "border-line-soft text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="divide-y divide-line">
            {cat.entries.map((e, i) => (
              <details
                key={i}
                className="group py-5"
                open={i < 2}
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <div className="flex gap-3">
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-surface font-mono text-xs font-bold text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-base font-semibold leading-relaxed text-white md:text-lg">
                      {e.q}
                    </h3>
                  </div>
                  <span className="mt-1 font-mono text-lg text-accent group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 ml-10 text-sm leading-[1.8] text-muted md:text-base">
                  {e.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-card border border-line bg-surface p-6">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              沒找到你的問題？
            </div>
            <p className="mt-2 text-sm text-muted">
              寫信到{" "}
              <a
                href="mailto:info@symcio.tw"
                className="text-accent no-underline"
              >
                info@symcio.tw
              </a>
              ，或加入{" "}
              <a
                href="https://discord.gg/jGWJr2Sd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent no-underline"
              >
                Discord 社群
              </a>
              ，24 小時內回覆。
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export const dynamicParams = false;
