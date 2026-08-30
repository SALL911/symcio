import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  PRODUCT_LADDER,
  POSITIONING_PARAGRAPH_ZH,
  POSITIONING_PARAGRAPH_EN,
  SCOPE,
} from "@/lib/positioning";

export const metadata: Metadata = {
  title: "AI 能見度基線與追蹤（AIVI）— Symcio",
  description:
    "量測品牌在 ChatGPT、Claude、Gemini、Perplexity 中的能見度：提及率、排名、引用來源。" +
    "固定費第三方報告，只做量測不做行銷執行。台灣中英雙語 AI 可見度追蹤。",
  alternates: { canonical: "https://symcio.tw/aivi" },
  openGraph: {
    title: "AI 能見度基線與追蹤（AIVI）— Symcio",
    description:
      "跨引擎 AI 能見度量測。基線 → 90 天 POC → 月追蹤訂閱。固定費、中立第三方。",
    type: "website",
    locale: "zh_TW",
  },
};

const FAQ = [
  {
    q: "AIVI 和 SEO 有什麼不同？",
    a: "SEO 量的是使用者在搜尋結果頁看到什麼；AIVI 量的是使用者向 AI 提問時，AI 的回答裡有沒有你、排第幾、旁邊站著誰、引用了哪些來源。兩者的排序機制不同，改善路徑也不同。",
  },
  {
    q: "資料怎麼來的？會不會爬 ChatGPT 網頁版？",
    a: "只走各引擎的官方 API 與合規的 SERP 資料供應商，不爬取消費者版介面（違反服務條款）。因此報告一律註明「API 採樣，非消費者介面重現」——API 結果與消費者版畫面可能有差異，這個差異我們揭露，不掩飾。",
  },
  {
    q: "為什麼 Symcio 不順便幫我把分數做上去？",
    a: "同一家公司既評分又執行，報告就失去第三方效力，後續也無法作為 ESG 揭露或品牌估值的引用來源。改善執行由貴公司自做或交給執行夥伴，Symcio 只交付量測值，且一律固定費、不對成效抽成。",
  },
  {
    q: "為什麼題目鎖版 90 天不能改？",
    a: "趨勢要可比，題目就必須是同一組。中途改題等於換了尺，前後數字不能相減。需要調整時我們開新版本（v2）並保留舊版對照，不覆蓋歷史。",
  },
  {
    q: "多久看得到變化？",
    a: "引擎回答的變化通常落後於內容與第三方提及的變化。基線 3 個工作天可交；有意義的趨勢判讀建議至少 90 天、12 次採樣。",
  },
  {
    q: "需要提供什麼資料才能開始？",
    a: "品牌正式名稱與常見別名、官網網域、競品清單、目標市場語言。付費追蹤需先完成授權書與資料處理協議——沒有授權，我們不對外出具具名報告。",
  },
];

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://symcio.tw/aivi#service",
  name: "AI 能見度基線與追蹤（AIVI）",
  alternateName: "AI Visibility Baseline & Tracking",
  serviceType: "AI visibility measurement",
  provider: { "@id": "https://symcio.tw/#organization" },
  areaServed: ["TW", "US", "EU"],
  availableLanguage: ["zh-Hant", "en"],
  description: POSITIONING_PARAGRAPH_EN,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AIVI product ladder",
    itemListElement: PRODUCT_LADDER.map((p) => ({
      "@type": "Offer",
      name: p.name,
      description: p.summary,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "TWD",
        description: `${p.price}（${p.priceNote}）`,
      },
    })),
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://symcio.tw/aivi#faq",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const DIMENSIONS = [
  { key: "提及率 Presence", desc: "問到這個品類時，AI 回答裡出現你的比例。" },
  { key: "排名 Rank", desc: "被列出時排第幾；第一名與第七名不是同一件事。" },
  { key: "同框佔比 Share", desc: "同一題裡你與競品各被提到幾次。" },
  { key: "語氣 Sentiment", desc: "AI 描述你的用語是推薦、中性，還是保留。" },
  { key: "引用來源 Citation", desc: "AI 引用了哪些網址——這是可被改善的施力點。" },
  { key: "一致性 Consistency", desc: "不同引擎、不同語言講的是不是同一個你。" },
];

export default function AiviPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <Navigation />

      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            AIVI · AI Visibility Baseline &amp; Tracking
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            你的品牌，AI 認不認得？
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-[1.9] text-muted">
            我們量測品牌在 ChatGPT、Claude、Gemini、Perplexity 中的能見度——
            提及率、排名、同框競品、引用來源——以固定費出具第三方報告。
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-[1.9] text-muted">
            {POSITIONING_PARAGRAPH_ZH}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/audit"
              className="rounded-card bg-accent px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
            >
              先跑免費基線 →
            </Link>
            <a
              href="mailto:sall@symcio.tw?subject=AIVI%2090%20%E5%A4%A9%20POC%20%E8%A9%A2%E5%95%8F"
              className="rounded-card border border-line px-6 py-3 text-sm font-semibold text-ink no-underline hover:border-accent hover:text-accent"
            >
              詢問 90 天 POC
            </a>
          </div>
        </div>
      </section>

      {/* 量什麼 */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-bold md:text-3xl">量哪六件事</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DIMENSIONS.map((d) => (
              <div key={d.key} className="rounded-card border border-line p-6">
                <h3 className="font-mono text-sm text-accent">{d.key}</h3>
                <p className="mt-3 text-sm leading-[1.8] text-muted">{d.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-xs leading-[1.9] text-muted">
            採樣方式：各引擎官方 API 與合規 SERP 資料供應商，
            中英雙語各 40 題鎖版題庫，涵蓋品牌、品類、比較、購買意圖四種提問。
            報告一律註明「API 採樣，非消費者介面重現」。
          </p>
        </div>
      </section>

      {/* 產品階梯 */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-bold md:text-3xl">三個階段</h2>
          <p className="mt-3 text-sm text-muted">
            從一次快照，到可以放進年報的時序資料集。
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PRODUCT_LADDER.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-card border border-line p-7"
              >
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 font-mono text-xs text-muted">{p.nameEn}</p>
                <p className="mt-4 text-2xl font-bold text-accent">{p.price}</p>
                <p className="mt-1 text-xs text-muted">{p.priceNote}</p>
                <p className="mt-1 text-xs text-muted">交付週期：{p.duration}</p>
                <p className="mt-5 text-sm leading-[1.8] text-muted">{p.summary}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.deliverables.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="text-accent">·</span>
                      <span className="text-ink/90">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 邊界 */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-bold md:text-3xl">我們做什麼、不做什麼</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-card border border-accent bg-accent-soft p-7">
              <h3 className="font-mono text-xs uppercase tracking-widest text-accent">
                做
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {SCOPE.does.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-accent">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card border border-line p-7">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
                不做
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {SCOPE.doesNot.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span>−</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-[1.9] text-muted">
            理由很單純：同一家公司既評分又執行，報告就沒有第三方效力，
            也無法作為 ESG 揭露或品牌估值的引用來源。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-bold md:text-3xl">常見問答</h2>
          <div className="mt-6 divide-y divide-line">
            {FAQ.map((f, i) => (
              <details key={f.q} className="group py-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-ink md:text-lg">
                    {f.q}
                  </h3>
                  <span className="mt-1 font-mono text-lg text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-[1.8] text-muted md:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-12 max-w-3xl border-t border-line pt-8 text-xs leading-[1.9] text-muted">
            {POSITIONING_PARAGRAPH_EN}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
