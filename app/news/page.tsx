import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { sortedEntries } from "@/lib/news-data";

export const metadata: Metadata = {
  title: "電子報 · AI 整理的 ESG/SDG 重點附 Brand Capital 解讀 — Symcio",
  description:
    "Symcio 每週電子報:AI 整理的 ESG / SDG 監管與政策重點,搭配 BCI 品牌資本三軸(FBV / SCV / AIV)解讀。可訂閱、可隨時退訂。",
  openGraph: {
    title: "Symcio 每週電子報 · ESG/SDG × Brand Capital",
    description:
      "AI 整理的 ESG / SDG 重點,附 Symcio Brand Capital 解讀。每週發報。",
    type: "website",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function NewsIndexPage() {
  const entries = sortedEntries();

  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Symcio Weekly · 電子報
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            AI 整理的 ESG / SDG 重點<br />附 Brand Capital 解讀
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            每週一封,Symcio 用 AI 整理當週全球 ESG / SDG / AI 治理的關鍵變化,
            並從 BCI 品牌資本三軸 ——
            <strong className="text-ink"> 財務品牌價值(FBV)</strong>、
            <strong className="text-ink">永續合規價值(SCV)</strong>、
            <strong className="text-ink">AI 可見度價值(AIV)</strong>
            —— 給出可行動的解讀。
          </p>

          <div className="mt-10 max-w-xl rounded-card border border-line bg-surface p-6">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            最新發報
          </div>
          <ul className="mt-6 space-y-6">
            {entries.map((e) => (
              <li
                key={e.slug}
                className="rounded-card border border-line bg-surface p-6 transition hover:border-accent"
              >
                <Link href={`/news/${e.slug}`} className="block no-underline">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <time dateTime={e.publishedAt} className="font-mono">
                      {formatDate(e.publishedAt)}
                    </time>
                    {e.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-ink md:text-2xl">
                    {e.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {e.summary}
                  </p>
                  <p className="mt-4 font-mono text-xs text-accent">
                    閱讀全文 →
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {entries.length === 0 && (
            <p className="mt-6 text-sm text-muted">
              第一期即將發報。先訂閱,首期會寄到你的信箱。
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
