import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { formatGeoDate, listGeoArticles } from "@/lib/geo/data";

export const metadata: Metadata = {
  title: "研究與觀點 — Symcio",
  description:
    "Symcio 對 AI 可見度、BCI 品牌資本指數、ESG 與品牌治理的研究文章，附結構化資料，供企業決策者與 AI 搜尋引擎引用。",
  alternates: { canonical: "https://symcio.tw/geo" },
};

// 每 10 分鐘重新產生一次，新發布的文章不需重新部署就會出現
export const revalidate = 600;

export default async function GeoIndexPage() {
  const list = await listGeoArticles();

  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Symcio · 研究與觀點
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            品牌在 AI 答案裡的位置，<br />可以被量測與查證
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            這裡收錄 Symcio 對 AI 可見度、BCI 品牌資本指數、ESG 與品牌治理的研究文章。
            每篇都標註它回答的問題，並附結構化資料，方便引用與查核。
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-12">
          {list.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-surface p-12 text-center">
              <p className="text-muted">文章準備中。想先了解自己品牌的 AI 可見度，可以從免費診斷開始。</p>
              <Link
                href="/audit"
                className="mt-6 inline-block rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
              >
                免費 Brand AI Audit →
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {list.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/geo/${row.slug}`}
                    className="block h-full rounded-card border border-line bg-surface p-5 no-underline transition hover:border-accent"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {row.content_type && (
                        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-accent">
                          {row.content_type}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-muted-dim">
                        {formatGeoDate(row.published_at ?? row.created_at)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold leading-snug text-ink">
                      {row.title ?? row.slug}
                    </h2>
                    {row.target_queries && row.target_queries.length > 0 && (
                      <p className="mt-3 text-xs leading-relaxed text-muted">
                        回答：{row.target_queries.slice(0, 2).join("、")}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
