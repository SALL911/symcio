import Link from "next/link";
import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Symcio BrandOS — 量化品牌 AI 基礎設施系統",
  description:
    "為有外銷、有品牌、缺合規資源的中小企業設計。三階段流程 — 診斷 (BCI 免費)、治理 (ESG 內容自動化 30,000/月起)、資產化 (品牌估值 + DPP 合規)。",
};

const STAGES = [
  {
    idx: "I",
    title: "板塊一 · 診斷與敘事奠基",
    sub: "Stage 0 診斷 · Stage 1 敘事",
    desc: "3 分鐘 BCI 快速診斷 + 品牌核心敘事定錨；建立後續治理的基準線。",
    tone: "accent",
  },
  {
    idx: "II",
    title: "板塊二 · 治理與數位基建",
    sub: "Stage 2 制度 · Stage 3 數據",
    desc: "Wikidata / Schema.org 實體建置、AI 語料治理制度、Supabase 資料倉儲接入。",
    tone: "accent",
  },
  {
    idx: "III",
    title: "板塊三 · 資產化與合規治理",
    sub: "Stage 4 流量 · Stage 5 合規",
    desc: "四引擎 AI 可見度追蹤、ESG 內容自動化、DPP 欄位對接、BCI 時序化資產量化。",
    tone: "excellent",
  },
  {
    idx: "IV",
    title: "板塊四 · 商模重構與資本化",
    sub: "Stage 6 商模 · Stage 7/8 資本與併購",
    desc: "ISO 10668 品牌估值、政府補助申請支援、融資洽談文件包、併購估值支援。",
    tone: "warning",
  },
];

const PHASES = [
  {
    code: "Phase 1",
    label: "診斷",
    tagline: "免費 · 3 分鐘",
    pricing: "免費",
    pricingNote: "PDF 報告下載",
    title: "BCI 品牌能見度診斷",
    desc: "輸入品牌名稱,3 分鐘出 PDF 報告。ChatGPT / Perplexity / Google AI / Claude 四引擎能見度量化,附改善建議。",
    deliverables: [
      "BCI 分數與四引擎能見度報告",
      "競品同框分析",
      "GEO 改善建議（3 項具體 Action）",
      "可下載 PDF",
    ],
    ctaLabel: "免費試用診斷",
    ctaHref: "/audit",
  },
  {
    code: "Phase 2",
    label: "治理",
    tagline: "月費制 · 持續交付",
    pricing: "NTD 30,000 起",
    pricingNote: "/月 · 月費制",
    title: "ESG 內容自動化 + 資料治理",
    desc: "為有外銷、品牌、合規壓力的中小企業導入完整的數位治理與內容自動化系統。每月 30 則 ESG 自動內容,並接通 DPP 所需欄位結構。",
    deliverables: [
      "30 則/月 ESG 自動內容",
      "單一平台發布 + 產業自動篩選",
      "品牌數位資產盤點（官網/社群/產品頁）",
      "DPP 數據欄位對接與結構化",
    ],
    ctaLabel: "預約治理 Demo",
    ctaHref: "mailto:sall@symcio.tw?subject=Phase%202%20%E6%B2%BB%E7%90%86%20Demo",
  },
  {
    code: "Phase 3",
    label: "資產化",
    tagline: "年約 · 客製規模",
    pricing: "客製報價",
    pricingNote: "年約 · 客製方案",
    title: "品牌估值 + DPP 合規 + 內容資產",
    desc: "Phase 2 的擴展版本:多平台 ESG 內容 + 品牌 CI 套版 + 客製議題管線,加上 ISO 10668 精神之品牌估值與融資/補助文件包,把品牌轉成可入帳的無形資產。",
    deliverables: [
      "30 則/月 ESG 內容 + 專業解讀",
      "多平台分發（官網/社群/電子報）+ CI 套版",
      "ISO 10668 精神之品牌估值報告 + DPP 合規報告",
      "嵌入客戶 CMS API · 耀飛/SITI 補助文件",
    ],
    ctaLabel: "聯繫資產化規劃",
    ctaHref: "mailto:sall@symcio.tw?subject=Phase%203%20%E5%93%81%E7%89%8C%E8%B3%87%E7%94%A2%E5%8C%96",
  },
];

const PLANS = [
  {
    name: "Phase 1 · 診斷",
    price: "NTD 0",
    period: "免費 · 3 分鐘",
    items: [
      "BCI 品牌可見度診斷",
      "四引擎能見度報告",
      "GEO 改善建議",
      "PDF 報告下載",
    ],
    cta: "立即試用",
    href: "/audit",
  },
  {
    name: "Phase 2 · 治理",
    price: "NTD 30,000 起",
    period: "/月 · 月費制",
    items: [
      "30 則/月 ESG 自動內容",
      "單一平台發布 + 產業篩選",
      "DPP 欄位對接",
      "雙月策略 office hour",
    ],
    cta: "預約 Demo",
    href: "mailto:sall@symcio.tw?subject=Phase%202%20%E6%B2%BB%E7%90%86%20Demo",
    featured: true,
  },
  {
    name: "Phase 3 · 資產化",
    price: "客製報價",
    period: "年約",
    items: [
      "多平台 ESG 內容 + CI 套版",
      "ISO 10668 品牌估值報告",
      "DPP 合規完整報告",
      "融資/補助文件包",
    ],
    cta: "聯繫規劃",
    href: "mailto:sall@symcio.tw?subject=Phase%203%20%E5%93%81%E7%89%8C%E8%B3%87%E7%94%A2%E5%8C%96",
  },
];

const PARTNERS = [
  "TAISE",
  "BCSD",
  "B Lab",
  "ESGpedia",
  "社創中心",
];

// Top 8 ABVI preview — abstract placeholder data until live dashboard ships.
// Labels are intentionally Brand A–H to avoid misrepresenting real companies.
const TOP8 = [
  { rank: 1, brand: "Brand A", industry: "半導體", abvi: 87, delta: 4 },
  { rank: 2, brand: "Brand B", industry: "金融", abvi: 82, delta: 0 },
  { rank: 3, brand: "Brand C", industry: "電商", abvi: 78, delta: -2 },
  { rank: 4, brand: "Brand D", industry: "製造", abvi: 74, delta: 1 },
  { rank: 5, brand: "Brand E", industry: "B2B SaaS", abvi: 69, delta: 6 },
  { rank: 6, brand: "Brand F", industry: "消費品", abvi: 65, delta: 0 },
  { rank: 7, brand: "Brand G", industry: "媒體", abvi: 61, delta: -3 },
  { rank: 8, brand: "Brand H", industry: "醫療", abvi: 58, delta: 2 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      {/* Hero — eco-themed dark cinematic */}
      <section className="relative isolate overflow-hidden border-b border-line bg-black text-white">
        {/* Background: dark tropical-leaf image */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-leaves.jpg')" }}
        />
        {/* Tint + readability gradient */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/35"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/30"
        />

        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300/90">
            Symcio · BrandOS
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] text-white md:text-6xl">
            為品牌和自營商打造的
            <br />
            <span className="text-emerald-300">BrandOS</span>
            <br />
            量化品牌 AI 基礎設施系統
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            你的 CMO 上週又被問「為什麼 ChatGPT 沒提到我們?」嗎?
            <br />
            Symcio 跨四引擎量化品牌曝光,3 分鐘看見 AI 怎麼描述你。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-card bg-emerald-400 px-7 py-3.5 text-sm font-bold text-black no-underline hover:bg-emerald-300 transition"
            >
              免費品牌 AI 健檢 →
            </Link>
            <a
              href="https://discord.gg/jGWJr2Sd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-card border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-bold text-white no-underline backdrop-blur hover:border-emerald-300 hover:text-emerald-300"
            >
              💬 Discord 社群
            </a>
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-card border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-bold text-white no-underline backdrop-blur hover:border-emerald-300 hover:text-emerald-300"
            >
              🐙 GitHub 協作
            </a>
          </div>

          {/* Eco-tagline strip — echoes the PDF's "Modern Eco Solutions" tone */}
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            <span>BCI 品牌資本指數</span>
            <span className="hidden h-px w-8 bg-white/30 md:inline-block" />
            <span>ISO 10668 Spirit</span>
            <span className="hidden h-px w-8 bg-white/30 md:inline-block" />
            <span>EU DPP Ready</span>
            <span className="hidden h-px w-8 bg-white/30 md:inline-block" />
            <span>4-Engine AI Visibility</span>
          </div>
        </div>
      </section>

      {/* Four-stage boards */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Brand Capital Upgrade Path
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            品牌資產升級 · 四大板塊
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            從診斷到資本化的完整路徑。左列 ESG,右列 Capital / Sustainable governance,兩條治理軸貫穿四個板塊。
          </p>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-excellent" />
              <span className="text-muted">ESG · 永續治理軸</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-warning" />
              <span className="text-muted">Capital · 資本化軸</span>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s, i) => {
              const tone =
                s.tone === "excellent"
                  ? "border-excellent/40"
                  : s.tone === "warning"
                    ? "border-warning/40"
                    : "border-accent/40";
              return (
                <div
                  key={s.idx}
                  className={`relative rounded-card border ${tone} bg-surface p-6 transition hover:translate-y-[-2px] hover:border-accent hover:shadow-sm`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
                      Stage 0{i * 2}
                    </span>
                    <span
                      className={`font-mono text-2xl font-bold ${s.tone === "excellent" ? "text-excellent" : s.tone === "warning" ? "text-warning" : "text-accent"}`}
                    >
                      {s.idx}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-muted">{s.sub}</div>
                  <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {s.desc}
                  </p>
                  <div
                    className={`mt-5 font-mono text-xs ${s.tone === "excellent" ? "text-excellent" : s.tone === "warning" ? "text-warning" : "text-accent"}`}
                  >
                    →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BCI Formula */}
      <section className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Brand Capital Index
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            BCI · 品牌資本指數
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Symcio 提出的三維品牌資本量化指標 — 把財務、永續合規、AI 可見度三條原本獨立的觀察軸,整合為單一時序。
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-card border border-line bg-surface p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-accent">
                FBV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                財務品牌價值
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Financial Brand Value · 方法論精神參考 ISO 10668 國際品牌評價標準(非該標準合規認證)。
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-excellent">
                SCV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                永續合規價值
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Sustainability Compliance Value · 法規中立設計,涵蓋目標市場永續法規合規準備度、ESG 揭露品質與自然資本評估。
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-warning">
                AIV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                AI 可見度價值
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                AI Visibility Value · Symcio 獨創;跨 ChatGPT、Perplexity、Google AI Overview、Claude 四引擎的引用頻率與品質。
              </p>
            </div>
          </div>

          <p className="mt-6 font-mono text-xs text-muted">
            完整公式、權重結構與校準邏輯於獨立研究論文公開 ·{" "}
            <a
              href="https://symcio-research.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              Symcio Research →
            </a>
            <br />
            BCI 為觀察性指標,不構成品牌估值意見書、投資建議或財務報告。
          </p>
        </div>
      </section>

      {/* Service Flow — 3 Phases */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Service Flow · 三階段服務流程
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            診斷 → 治理 → 資產化
          </h2>
          <p className="mt-3 max-w-3xl text-muted">
            不是幫你做行銷,是幫你的品牌
            <span className="font-semibold text-ink">數據合規、AI 可見、資產可估</span>
            。三階段對應外銷中小企業的真實需求曲線:從免費診斷,到月費治理,再到品牌資產化。
          </p>

          <div className="relative mt-10 grid gap-5 md:grid-cols-3">
            {PHASES.map((p, i) => (
              <div key={p.code} className="relative flex">
                <div className="flex w-full flex-col rounded-card border border-accent/30 bg-surface p-6 transition hover:border-accent hover:shadow-sm md:p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[2px] text-accent">
                      {p.code} · {p.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted">
                      {p.tagline}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {p.desc}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.deliverables.map((d) => (
                      <li key={d} className="flex gap-2 text-ink/90">
                        <span className="text-accent">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 border-t border-line pt-4">
                    <div className="font-mono text-2xl font-bold text-ink">
                      {p.pricing}
                    </div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[1px] text-muted">
                      {p.pricingNote}
                    </div>
                  </div>
                  <a
                    href={p.ctaHref}
                    className="mt-6 inline-flex items-center justify-center rounded-card border border-accent px-5 py-2.5 text-sm font-bold text-accent no-underline hover:bg-accent hover:text-white transition"
                  >
                    {p.ctaLabel} →
                  </a>
                </div>
                {i < PHASES.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-bg text-accent text-sm font-bold"
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-xs text-muted">
            外銷中小企業的合規時程已啟動:EU DPP 即將上路,通路商開始要求 ESG 資料 ·
            Phase 1 → 2 → 3 為觀察性流程,實際對應依個案需求調整。
          </p>
        </div>
      </section>

      {/* AI Visibility Index — Top 8 preview */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            {/* Left — copy */}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                AI Visibility Index · Live
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
                台灣品牌
                <br />
                AI 能見度指數
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
                每日跨 ChatGPT、Claude、Gemini、Perplexity 四引擎抓取,計算 ABVI
                綜合分數與週變動。前 100 名公開排行,完整指標與歷史走勢於儀表板查詢。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-card bg-accent px-6 py-3 text-sm font-bold text-white no-underline hover:bg-accent-dim transition"
                >
                  查看完整排行榜 →
                </Link>
                <Link
                  href="/audit"
                  className="inline-flex items-center justify-center rounded-card border border-line px-6 py-3 text-sm font-bold text-ink no-underline hover:border-accent hover:text-accent"
                >
                  測我的品牌分數
                </Link>
              </div>
              <p className="mt-6 font-mono text-xs text-muted">
                方法論依循 ISO 10668 · ABVI v2 · 每週一 09:00 (UTC+8) 更新
              </p>
            </div>

            {/* Right — Top 8 dark green card */}
            <div className="rounded-card bg-accent p-1 shadow-sm">
              <div className="rounded-[10px] bg-accent px-6 py-7 md:px-8 md:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                      ABVI Top 8 · Week 20
                    </p>
                    <p className="mt-1 font-bold text-white">本週能見度排行</p>
                  </div>
                  <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
                    示意數據
                  </span>
                </div>

                <ul className="mt-6 divide-y divide-white/10">
                  {TOP8.map((row) => {
                    const deltaCls =
                      row.delta > 0
                        ? "text-excellent"
                        : row.delta < 0
                          ? "text-danger"
                          : "text-white/50";
                    const deltaGlyph =
                      row.delta > 0 ? "▲" : row.delta < 0 ? "▼" : "—";
                    return (
                      <li
                        key={row.rank}
                        className="grid grid-cols-[2rem_1fr_auto_2.75rem] items-center gap-3 py-3"
                      >
                        <span className="font-mono text-sm font-bold text-white/50 tabular-nums">
                          {String(row.rank).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">
                            {row.brand}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[1px] text-white/50">
                            {row.industry}
                          </div>
                        </div>
                        <span className="font-mono text-base font-bold text-white tabular-nums">
                          {row.abvi}
                        </span>
                        <span
                          className={`text-right font-mono text-xs font-semibold tabular-nums ${deltaCls}`}
                        >
                          {deltaGlyph}{" "}
                          {row.delta === 0
                            ? "0"
                            : Math.abs(row.delta).toString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 border-t border-white/10 pt-4 text-center">
                  <Link
                    href="/dashboard"
                    className="font-mono text-xs text-white/80 no-underline hover:text-white"
                  >
                    完整排行榜（Top 100） →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            三級方案
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-card border ${p.featured ? "border-accent shadow-sm" : "border-line"} bg-surface p-7 relative`}
              >
                {p.featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[1px] text-white">
                    最受歡迎
                  </span>
                )}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <div className="mt-4 font-mono text-3xl font-bold">
                  {p.price}
                </div>
                <div className="mt-1 text-sm text-muted">{p.period}</div>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2 text-ink">
                      <span className="text-excellent">✓</span>
                      {i}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className={`mt-7 block rounded-card px-6 py-3 text-center text-sm font-semibold no-underline ${
                    p.featured
                      ? "bg-accent text-white hover:bg-accent-dim"
                      : "border border-line text-ink hover:border-accent hover:text-accent"
                  } transition`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm text-accent no-underline hover:underline"
            >
              查看完整方案對照 →
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Community
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            加入 BrandOS 社群
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <a
              href="https://discord.gg/jGWJr2Sd"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent hover:shadow-sm"
            >
              <div className="text-3xl">💬</div>
              <h3 className="mt-3 text-lg font-bold text-ink">Discord</h3>
              <p className="mt-2 text-sm text-muted">
                品牌長、ESG 永續長、AI SEO 社群每週互動;免費 office hour。
              </p>
              <div className="mt-4 font-mono text-xs text-accent">
                discord.gg/jGWJr2Sd →
              </div>
            </a>
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent hover:shadow-sm"
            >
              <div className="text-3xl">🐙</div>
              <h3 className="mt-3 text-lg font-bold text-ink">GitHub</h3>
              <p className="mt-2 text-sm text-muted">
                BCI 方法論、scoring engine、provider adapters 全開源;歡迎 PR。
              </p>
              <div className="mt-4 font-mono text-xs text-accent">
                github.com/sall911/symcio →
              </div>
            </a>
            <a
              href="https://esgpedia.io"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent hover:shadow-sm"
            >
              <div className="text-3xl">📚</div>
              <h3 className="mt-3 text-lg font-bold text-ink">ESGpedia</h3>
              <p className="mt-2 text-sm text-muted">
                亞太 ESG 資料庫合作夥伴（洽談中）;資料層整合進 SCV 永續合規分軸。
              </p>
              <div className="mt-4 font-mono text-xs text-accent">
                esgpedia.io →
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Policy Research */}
      <section className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                Policy Research · 政策研究
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
                Symcio Research
                <br />
                <span className="text-accent">政策、白皮書、量化研究</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
                BCI 方法論白皮書、EU DPP 在地化框架、AI 治理立法觀察、
                外銷中小企業合規時程分析。所有研究產出以 CC BY 4.0 授權,供主管機關、
                學術單位、媒體免費引用。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://symcio-research.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-card bg-accent px-6 py-3 text-sm font-bold text-white no-underline hover:bg-accent-dim transition"
                >
                  進入 Symcio Research →
                </a>
                <a
                  href="https://github.com/SALL911/BrandOS-Infrastructure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-card border border-line px-6 py-3 text-sm font-bold text-ink no-underline hover:border-accent hover:text-accent"
                >
                  方法論 GitHub
                </a>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                {
                  tag: "Whitepaper",
                  title: "BCI v2 — 品牌資本指數方法論",
                  meta: "32 頁 · 2026 Q1",
                },
                {
                  tag: "Policy Brief",
                  title: "台灣 ESG 揭露時程與 IFRS S1/S2 接軌",
                  meta: "14 頁 · 2026 Q2",
                },
                {
                  tag: "Research",
                  title: "AI 引擎引用偏差 — 繁中語料密度實測",
                  meta: "Working paper · 2026 Q2",
                },
                {
                  tag: "Framework",
                  title: "EU DPP 在地化指南（外銷製造業）",
                  meta: "預計 2026 Q3",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="rounded-card border border-line bg-surface p-5 transition hover:border-accent hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-accent">
                      {item.tag}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted">
                      {item.meta}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-b border-line bg-accent text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            BrandOS Weekly
          </h2>
          <p className="mt-3 text-base text-white/80">
            每週一封 — AI 可見度最新動態、GEO 策略、BCI 方法論更新。
          </p>
          <form
            action="mailto:info@symcio.tw?subject=BrandOS%20Weekly%20Subscribe"
            method="post"
            encType="text/plain"
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              className="flex-1 rounded-card border border-white/30 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-white focus:bg-white/20 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-card bg-white px-6 py-3 text-sm font-bold text-accent hover:bg-white/90 transition"
            >
              訂閱 BrandOS Weekly
            </button>
          </form>
          <p className="mt-3 font-mono text-xs text-white/60">
            隨時可退訂 · 不轉售名單
          </p>
        </div>
      </section>

      {/* Partner logos */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Partners · 合作洽談中
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {PARTNERS.map((p) => (
              <span
                key={p}
                className="font-mono text-base font-semibold tracking-wide text-muted"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
