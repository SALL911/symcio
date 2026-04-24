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
    tagline: "驗證品牌在 AI 的基準分數。",
    items: [
      "BCI 品牌可見度快速診斷（1 次/月）",
      "ChatGPT / Claude / Gemini / Perplexity 四引擎",
      "基礎 GEO 改善建議",
      "Discord 社群參與",
      "Entity Builder 工具使用",
    ],
    missing: ["PDF 完整報告", "競品追蹤", "顧問諮詢"],
    cta: "立即試用",
    ctaHref: "/audit",
    featured: false,
  },
  {
    name: "專業版 Professional",
    price: "NTD 100,000",
    period: "/ 年（月付 NTD 9,000）",
    tagline: "成長型品牌的實戰主力。",
    items: [
      "免費版全部功能",
      "每月 BCI 完整報告（含 PDF）",
      "Wikidata + Schema.org 實體建置與管理",
      "GEO 內容策略規劃",
      "四大 AI 平台持續追蹤",
      "5 個競品 AI 可見度月報",
      "季度策略會議（線上）",
    ],
    missing: ["ESG / TNFD 報告", "Brand Capital API"],
    cta: "聯繫我們",
    ctaHref: "mailto:sall@symcio.tw?subject=%E5%B0%88%E6%A5%AD%E7%89%88%E6%96%B9%E6%A1%88%E8%A9%A2%E5%95%8F",
    featured: true,
  },
  {
    name: "企業版 Enterprise",
    price: "NTD 250–500k",
    period: "/ 年（依規模）",
    tagline: "上市櫃公司、金融機構、跨國品牌。",
    items: [
      "專業版全部功能",
      "ESG / TNFD 永續報告自動化",
      "Brand Capital API 授權",
      "BCI 品牌資本指數完整分析",
      "運動產業發展條例 175% 抵稅方案支援",
      "專屬品牌治理顧問（每月 2 次）",
      "金融機構品牌數據授權",
      "SLA 99.5% + 24 小時支援",
    ],
    missing: [],
    cta: "預約 Demo",
    ctaHref: "mailto:sall@symcio.tw?subject=%E4%BC%81%E6%A5%AD%E7%89%88Demo%E9%A0%90%E7%B4%84",
    featured: false,
  },
];

const FAQ = [
  {
    q: "BCI 的方法論是什麼？",
    a: "BCI (Brand Capital Index) 依循 ISO 10668 國際品牌評價標準，整合財務品牌價值 (FBV)、自然資本價值 (NCV) 和 AI 可見度價值 (AIV) 三個維度。FBV 參考 Interbrand 方法論、NCV 基於 TNFD LEAP 框架、AIV 為 Symcio 獨創的跨四引擎（ChatGPT / Perplexity / Google AI / Claude）加權提及率。",
  },
  {
    q: "免費版和付費版的主要差異？",
    a: "免費版提供一次性的快速診斷，適合初步了解品牌在 AI 的表現。付費版提供持續追蹤、競品分析、GEO 策略規劃和專屬顧問服務，幫助品牌在 AI 時代持續提升可見度。企業版額外包含 ESG/TNFD 報告自動化與 Brand Capital API 授權。",
  },
  {
    q: "多久可以看到 AI 可見度提升？",
    a: "基礎建設（Wikidata + Schema.org）上線後約 2–4 週開始見效；AI 引擎重新爬取後，Knowledge Graph 會開始「認識」您的品牌。持續的 GEO 內容策略通常在 3–6 個月內帶來顯著的 AI 可見度提升，並反映在 BCI 分數上。",
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
    <main className="min-h-screen bg-ink text-white">
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
            從免費健檢到全方位品牌資本管理 — 依循 ISO 10668。
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-card border ${p.featured ? "border-accent bg-accent/5" : "border-line bg-surface"} p-6 md:p-8`}
              >
                {p.featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[1px] text-ink">
                    最受歡迎
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <p className="mt-3 font-mono text-3xl font-bold md:text-4xl">
                  {p.price}
                </p>
                <p className="mt-1 text-sm text-muted">{p.period}</p>
                <p className="mt-4 text-sm text-muted">{p.tagline}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-excellent">✓</span>
                      <span className="text-white/90">{i}</span>
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
                      ? "bg-accent text-ink hover:scale-[1.02]"
                      : "border border-line-soft text-white hover:border-accent hover:text-accent"
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
                    <h3 className="text-base font-semibold text-white md:text-lg">
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
