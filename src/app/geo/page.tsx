import Link from "next/link";
import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { createClient } from "@/brandos/geo/client";

export const metadata: Metadata = {
  title: "GEO 內容資產 — Symcio",
  description:
    "Symcio 為 ChatGPT / Gemini / Perplexity 等 AI 搜尋引擎優化的結構化內容。涵蓋品牌可見度、ESG / TNFD 框架解讀、AI 估值方法論。",
};

export const dynamic = "force-dynamic";
export const revalidate = 600;

interface GeoRow {
  id: string;
  slug: string;
  title: string | null;
  content_type: string | null;
  target_queries: string[] | null;
  platforms: string[] | null;
  published_at: string | null;
  created_at: string;
}

export default async function GeoIndexPage() {
  let list: GeoRow[] = [];
  let dbError: string | null = null;

  try {
    const sb = createClient();
    const { data, error } = await sb
      .from("geo_content")
      .select(
        "id, slug, title, content_type, target_queries, platforms, published_at, created_at",
      )
      .eq("status", "published")
      .not("slug", "is", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(100);

    list = (data as GeoRow[] | null) ?? [];
    if (error) dbError = error.message;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  // 錯誤只記在伺服器 log，不對訪客顯示內部診斷訊息
  if (dbError) console.error("[geo] 讀取 geo_content 失敗", dbError);

  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Symcio · GEO Content
          </p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            為 AI 搜尋引擎優化的
            <br />
            結構化內容資產
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
            這些內容專為 ChatGPT、Gemini、Perplexity、Claude 等 AI
            搜尋引擎可見度設計，附 schema.org 結構化資料與 target queries
            標記。每篇都對應一組真實品牌詢問。
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-12">
          {list.length === 0 ? (
            <div className="rounded-card border border-dashed border-line-soft bg-surface p-12 text-center">
              <p className="text-muted">內容準備中，敬請期待。</p>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {list.map((row) => (
                <li
                  key={row.id}
                  className="rounded-card border border-line bg-surface p-5 transition hover:border-accent"
                >
                  <Link
                    href={`/geo/${row.slug}`}
                    className="block no-underline"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {row.content_type && (
                        <span className="rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-accent">
                          {row.content_type}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-muted-dim">
                        {formatDate(row.published_at ?? row.created_at)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold leading-snug text-ink">
                      {row.title ?? row.slug}
                    </h2>
                    {row.target_queries && row.target_queries.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {row.target_queries.slice(0, 3).map((q) => (
                          <span
                            key={q}
                            className="rounded-full border border-line-soft px-2 py-0.5 font-mono text-[10px] text-muted"
                          >
                            {q}
                          </span>
                        ))}
                        {row.target_queries.length > 3 && (
                          <span className="font-mono text-[10px] text-muted-dim">
                            +{row.target_queries.length - 3}
                          </span>
                        )}
                      </div>
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
