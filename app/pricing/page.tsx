import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "定價方案 — Symcio BrandOS",
  description:
    "免費版 NTD 0 · 專業版 NTD 100,000/年 · 企業版 NTD 250,000–500,000/年。Symcio BrandOS 三方案對照，依循 ISO 10668。",
};

const PLANS = [
  {
    name: "免費版 Free",
    price: "NTD 0",
    period: "永久免費",
    tagline: "30 秒看見 AI 怎麼描述你。",
    items: [
      "BCI 品牌可見度快速診斷（1 次/月）",
      "ChatGPT / Claude / Gemini / Perplexity 四引擎",
      "基礎 GEO 改善建議",
      "Discord 社群參與",
      "Entity Builder 工具使用",
    ],
    missing: ["PDF 完整報告", "競品對比圖表", "策略 office hour"],
    cta: "立即試用",
    ctaHref: "/audit",
    featured: false,
  },
  {
    name: "單次報告 Audit",
    price: "NTD 9,800",
    period: "/ 份（一次性付款）",
    tagline: "你的 CMO 上週又被問「為什麼 ChatGPT 沒提到我們?」",
    items: [
      "免費版全部功能",
      "20 prompt × 4 引擎完整掃描",
      "BCI 完整報告（含 PDF,10–12 頁）",
      "5 個競品 AI 可見度對比",
      "Wikidata + Schema.org 實體建議草稿",
      "GEO 改善建議（3 項具體 Action）",
      "30 天內免費重測一次",
    ],
    missing: ["持續追蹤", "季度策略 office hour"],
    cta: "購買單次報告",
    ctaHref: "/audit",
    featured: true,
  },
  {
    name: "企業合作 Enterprise",
    price: "Contact",
    period: "報價依規模與需求客製",
    tagline: "上市櫃公司、跨國品牌、ESG 撰寫團隊。",
    items: [
      "單次報告全部功能",
      "永續報告書素材結構化整理（TNFD / GRI / IFRS S1S2 框架對齊)",
      "Brand Capital API 接入（資料格式 JSON / CSV）",
      "競品集合追蹤與走勢分析",
      "贊助/行銷投資的品牌曝光成效量化資料",
      "策略 office hour（雙月一次,線上）",
      "資料治理與 opt-out 流程支援",
    ],
    missing: [],
    cta: "聯繫我們",
    ctaHref: "mailto:sall@symcio.tw?subject=%E4%BC%81%E6%A5%AD%E5%90%88%E4%BD%9C%E6%B4%BD%E8%A9%A2",
    featured: false,
  },
];

const FAQ = [
  {
    q: "BCI 的方法論是什麼?",
    a: "BCI (Brand Capital Index) 框架參考 ISO 10668 國際品牌評價標準精神（非該標準合規認證）,整合財務視角品牌強度 (FBV)、自然資本觀察值 (NCV) 和 AI 可見度觀察值 (AIV) 三個維度。FBV 觀察邏輯參考 Interbrand 等公開方法論的因子拆解、NCV 對齊 TNFD LEAP 框架欄位、AIV 為 Symcio 提出的跨四引擎（ChatGPT / Perplexity / Google AI / Claude）加權提及率。BCI 為觀察性指標,不構成品牌估值意見書、投資建議或財務報告。",
  },
  {
    q: "免費版和單次報告的主要差異?",
    a: "免費版提供 1 個 prompt 的快速掃描,適合初步看見品牌在 AI 的基準表現。單次報告（Audit）跑 20 個產業標準化 prompt × 4 引擎,輸出完整 BCI 報告 PDF、5 個競品對比、3 項具體 GEO 改善建議,並包含 30 天內免費重測一次。企業合作為自訂方案,適合需要 API 接入或 ESG 報告書素材整理的團隊。",
  },
  {
    q: "AI 可見度多久可以看到改善?",
    a: "基礎建設（Wikidata + Schema.org）上線後,既有客戶的觀察大多在 2–4 週內可在 AI 引擎重新爬取後看見初步變化。完整的 GEO 內容策略執行,過往案例觀察 ABVI 分數於 3–6 個月內有 8–20 分的變動區間。每個品牌的起始基準、產業競爭密度、語料品質不同,改善幅度因案而異,Symcio 不保證特定數字結果。",
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
