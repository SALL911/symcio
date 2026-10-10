import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "定價方案 — Symcio BrandOS",
  description:
    "Phase 1 診斷免費 · Phase 2 AIVI 追蹤固定費 · Phase 3 資產化客製。Symcio 只交付量測值,不承接行銷執行、不對成效抽成。",
};

const PLANS = [
  {
    name: "Phase 1 · 診斷 Diagnose",
    price: "NTD 0",
    period: "免費試用 · 3 分鐘",
    tagline: "輸入品牌名稱,3 分鐘出 BCI 報告。",
    items: [
      "BCI 品牌可見度快速診斷",
      "ChatGPT / Claude / Gemini / Perplexity 四引擎",
      "缺口清單（哪一題、哪個引擎）",
      "PDF 報告下載",
      "Discord 社群參與",
    ],
    missing: ["週期追蹤與趨勢", "引用來源清單", "品牌估值報告"],
    cta: "立即試用診斷",
    ctaHref: "/audit",
    featured: false,
  },
  {
    name: "Phase 2 · 追蹤 Track",
    price: "固定費",
    period: "90 天起 · 報價後開案",
    tagline: "鎖版題庫週期採樣,把單次分數變成可比較的時序資料。",
    items: [
      "Phase 1 全部功能",
      "中英雙語各 40 題鎖版題庫",
      "12 次週採樣 × 四引擎",
      "before / after 對照表",
      "競品同框趨勢圖",
      "AI 回覆的引用來源清單",
      "10% 人工抽驗與方法論揭露",
      "雙月方法論 office hour",
    ],
    missing: ["品牌估值報告", "DPP 合規完整報告", "補助與融資文件包"],
    cta: "詢問 90 天 POC",
    ctaHref: "mailto:sall@symcio.tw?subject=AIVI%2090%20%E5%A4%A9%20POC",
    featured: true,
  },
  {
    name: "Phase 3 · 資產化 Capitalize",
    price: "客製報價",
    period: "年約 · 客製規模",
    tagline: "品牌變成可入帳的無形資產。",
    items: [
      "Phase 2 全部功能",
      "AIVI 月追蹤訂閱 + 六維度趨勢解讀",
      "季度量測回顧與競品對照",
      "ESG 揭露可引用的量測附錄",
      "Brand Capital API 程式化存取",
      "ISO 10668 精神之品牌估值報告",
      "DPP 合規完整報告",
      "耀飛 / SITI 等政府補助申請支援",
      "融資洽談所需證明文件包",
    ],
    missing: [],
    cta: "聯繫資產化規劃",
    ctaHref: "mailto:sall@symcio.tw?subject=Phase%203%20%E5%93%81%E7%89%8C%E8%B3%87%E7%94%A2%E5%8C%96",
    featured: false,
  },
];

const FAQ = [
  {
    q: "BCI 的方法論是什麼?",
    a: "BCI (Brand Capital Index) 框架參考 ISO 10668 國際品牌評價標準精神（非該標準合規認證）,整合財務品牌價值 (FBV)、永續合規價值 (SCV) 與 AI 可見度價值 (AIV) 三個維度。FBV 觀察邏輯參考 Interbrand 等公開方法論的因子拆解;SCV 為法規中立設計,涵蓋法規合規分數、ESG 揭露分數與自然資本分數;AIV 為 Symcio 提出的跨四引擎（ChatGPT / Perplexity / Google AI Overview / Claude）加權提及率。完整方法論於獨立研究論文公開。BCI 為觀察性指標,不構成品牌估值意見書、投資建議或財務報告。",
  },
  {
    q: "免費版和單次報告的主要差異?",
    a: "免費版提供 1 個 prompt 的快速掃描,適合初步看見品牌在 AI 的基準表現。單次報告（Audit）跑 20 個產業標準化 prompt × 4 引擎,輸出完整 BCI 報告 PDF、5 個競品對比、3 項最大缺口（哪一題、哪個引擎、輸給誰）,並包含 30 天內免費重測一次。企業合作為自訂方案,適合需要 API 接入或 ESG 報告書素材整理的團隊。",
  },
  {
    q: "Symcio 可以順便幫我把分數做上去嗎?",
    a: "不行,這是刻意的邊界。同一家公司既評分又執行,報告就失去第三方效力,也無法作為 ESG 揭露或品牌估值的引用來源。Symcio 只交付量測值,一律固定費、不對成效抽成;內容生產、外部曝光、schema 與 CMS 施作由貴公司自做,或由我們轉介執行夥伴承接。",
  },
  {
    q: "AI 可見度多久可以看到改善?",
    a: "改善施作由貴公司自做或交由執行夥伴承接,Symcio 只負責量測前後差異。依既有觀察,實體層（Wikidata + Schema.org）更新上線後約 2–4 週可在 AI 引擎重新爬取後看見初步變化;內容與第三方曝光的影響通常落後更久,建議以 90 天、12 次採樣為判讀基礎。每個品牌的起始基準、產業競爭密度、語料品質不同,Symcio 不保證特定數字結果。",
  },
];

export default function PricingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Pricing · 定價方案
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            選擇適合您的
            <br />
            品牌治理方案
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            從免費掃描到企業合作 — 方法論參考 ISO 10668 精神,完整公式開源於 GitHub。
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-xs text-gold">
            <span className="font-mono font-bold uppercase tracking-[1px]">Beta · 籌備期</span>
            <span>付款由 Stripe 處理,法人成立後年訂閱方案上架</span>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-card border ${p.featured ? "border-accent bg-accent/5" : "border-line bg-surface"} p-6 md:p-8`}
              >
                {p.featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[1px] text-white">
                    最受歡迎
                  </span>
                )}
                <h3 className="text-xl font-bold text-ink">{p.name}</h3>
                <p className="mt-3 font-mono text-3xl font-bold md:text-4xl">
                  {p.price}
                </p>
                <p className="mt-1 text-sm text-muted">{p.period}</p>
                <p className="mt-4 text-sm text-muted">{p.tagline}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-excellent">✓</span>
                      <span className="text-ink/90">{i}</span>
                    </li>
                  ))}
                  {p.missing.map((i) => (
                    <li key={i} className="flex gap-2 opacity-50">
                      <span>−</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={p.ctaHref}
                  className={`mt-8 inline-block w-full rounded-card px-5 py-3 text-center text-sm font-semibold no-underline transition ${
                    p.featured
                      ? "bg-accent text-white hover:bg-accent-dim"
                      : "border border-line text-ink hover:border-accent hover:text-accent"
                  }`}
                >
                  {p.cta} →
                </a>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold md:text-3xl">常見問答</h2>
            <div className="mt-6 divide-y divide-line">
              {FAQ.map((f, i) => (
                <details key={i} className="group py-5" open={i === 0}>
                  <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                    <h3 className="text-base font-semibold text-ink md:text-lg">
                      {f.q}
                    </h3>
                    <span className="mt-1 font-mono text-lg text-accent group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-[1.8] text-muted md:text-base">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/faq/enterprise"
                className="font-mono text-xs text-accent no-underline hover:underline"
              >
                查看完整 FAQ（5 個受眾 × 10 題）→
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
