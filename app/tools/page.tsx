import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "工具套件 — Symcio BrandOS",
  description:
    "Symcio 提供的品牌 AI 可見度工具組 — Brand AI Audit、Entity Builder、Typeform 健檢、Schema 產生器。",
};

const TOOLS = [
  {
    code: "01",
    name: "Brand AI Audit",
    desc: "3 分鐘完成 BCI 品牌資本指數診斷。跨 4 引擎 + 雷達圖 + 競品對比 + PDF 報告。",
    href: "/audit",
    cta: "開始診斷",
    free: true,
  },
  {
    code: "02",
    name: "GEO Entity Builder",
    desc: "自動生成 Wikidata entity + Schema.org JSON-LD + FAQPage Schema，5 分鐘完成基礎 GEO 建置。",
    href: "/tools/entity-builder",
    cta: "建立實體",
    free: true,
  },
  {
    code: "03",
    name: "Schema 產生器",
    desc: "Organization / Product / BreadcrumbList / FAQPage / HowTo 等結構化資料一鍵生成，複製貼到 <head>。",
    href: "/schema-generator",
    cta: "生成 Schema",
    free: true,
  },
  {
    code: "04",
    name: "Typeform 品牌健檢",
    desc: "非 BCI 路徑的入口 — 給不想填 10 欄的用戶；提交後接 Supabase leads 與 GitHub Actions audit。",
    href: "/tools/brand-check",
    cta: "開始填寫",
    free: true,
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Tools · 工具套件
          </p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            品牌 AI 基礎建設工具組
          </h1>
          <p className="mt-4 max-w-2xl text-muted md:text-lg">
            所有工具皆免費使用。進階功能 (CSV 匯出、API、批次處理) 在{" "}
            <Link href="/pricing" className="text-accent no-underline">
              專業版 / 企業版
            </Link>
            。
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            {TOOLS.map((t) => (
              <Link
                key={t.code}
                href={t.href}
                className="group rounded-card border border-line bg-surface p-7 no-underline transition hover:translate-y-[-2px] hover:border-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
                    Tool {t.code}
                  </span>
                  {t.free && (
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-accent">
                      Free
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-xl font-bold text-white">{t.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t.desc}
                </p>
                <div className="mt-5 font-mono text-sm text-accent group-hover:translate-x-1 transition-transform">
                  {t.cta} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
