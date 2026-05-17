import Link from "next/link";
import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Symcio BrandOS — 量化品牌 AI 基礎設施系統",
  description:
    "為品牌和自營商打造的 BrandOS。整合 TNFD 框架、Biocredit 自然資本、AI 可見度追蹤 — 讓品牌資本可量化、可追蹤、可治理。依循 ISO 10668。",
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
    title: "板塊三 · 資產化與 ESG 治理",
    sub: "Stage 4 流量 · Stage 5 綠色",
    desc: "四引擎 AI 可見度追蹤、TNFD LEAP 自然資本評估、BCI 時序化資產量化。",
    tone: "excellent",
  },
  {
    idx: "IV",
    title: "板塊四 · 商模重構與資本化",
    sub: "Stage 6 商模 · Stage 7/8 資本與併購",
    desc: "Brand Capital API 授權、金融機構數據接入、運動產業 175% 抵稅方案、併購估值支援。",
    tone: "warning",
  },
];

const MODULES = [
  {
    code: "01",
    name: "AI Visibility Index",
    desc: "追蹤品牌在 ChatGPT、Claude、Gemini、Perplexity 四引擎的曝光率、排名位置與情感趨勢。每日更新,可回溯 12 個月。",
    metrics: ["Mention Rate", "Average Rank", "Competitor Gap", "Sentiment"],
  },
  {
    code: "02",
    name: "ESG 報告素材整理",
    desc: "把 TNFD / GRI / IFRS S1-S2 / LEAP 框架欄位對應到結構化資料,讓你的永續報告書撰寫團隊省下 60–80% 素材整理時間。(非簽證服務)",
    metrics: ["Scope 1/2/3 欄位對齊", "TNFD Aligned", "GRI 2021", "IFRS S1/S2"],
  },
  {
    code: "03",
    name: "GEO Entity Builder",
    desc: "自動生成 Wikidata entity、Schema.org Organization JSON-LD、FAQPage Schema,讓 AI 引擎的知識圖譜正確認識你的品牌。",
    metrics: ["Wikidata", "Schema.org", "Knowledge Panel", "Entity Linking"],
  },
  {
    code: "04",
    name: "Brand Capital API",
    desc: "將品牌 AI 可見度、BCI 子分數、ESG 合規打包為 REST API,供內部 CRM、投資研究平台、Tableau / Power BI 直接取用。",
    metrics: ["REST API", "Webhook", "CSV Export", "SAML SSO"],
  },
  {
    code: "05",
    name: "TNFD / Biocredit",
    desc: "基於 TNFD LEAP 框架自動化自然資本評估、biocredit 估算、產業依賴度基準,整合進 NCV 分軸。",
    metrics: ["LEAP 四階段", "Biocredit", "NCV 評分", "自然資本時序"],
  },
  {
    code: "06",
    name: "贊助成效量化資料",
    desc: "贊助運動賽事、藝文活動、ESG 議題前後的品牌 AI 曝光變化量化,提供結構化資料供你的會計師、稅務顧問申報運動產業發展條例第 26-2 條等抵稅項目使用。(Symcio 不提供稅務意見)",
    metrics: ["贊助前後 ABVI", "競品同框分析", "議題關聯度", "資料可追溯"],
  },
];

const PLANS = [
  {
    name: "免費版 Free",
    price: "NTD 0",
    period: "永久免費",
    items: [
      "1 品牌 × 4 引擎",
      "每月 1 次掃描",
      "基礎 GEO 建議",
      "Discord 社群",
    ],
    cta: "免費試用",
    href: "/audit",
  },
  {
    name: "專業版 Professional",
    price: "NTD 100,000",
    period: "每年（或月付 9,000）",
    items: [
      "每月完整 BCI 報告（含 PDF）",
      "5 個競品追蹤",
      "GEO 實體建置",
      "季度策略會議",
    ],
    cta: "聯繫我們",
    href: "mailto:sall@symcio.tw?subject=%E5%B0%88%E6%A5%AD%E7%89%88%E6%96%B9%E6%A1%88",
    featured: true,
  },
  {
    name: "企業版 Enterprise",
    price: "NTD 250–500k",
    period: "每年（依規模）",
    items: [
      "Brand Capital API 授權",
      "ESG / TNFD 自動化",
      "175% 抵稅方案支援",
      "專屬治理顧問",
    ],
    cta: "預約 Demo",
    href: "mailto:sall@symcio.tw?subject=%E4%BC%81%E6%A5%AD%E7%89%88Demo",
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

      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Symcio · BrandOS
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] md:text-6xl">
            為品牌和自營商打造的
            <br />
            <span className="text-accent">BrandOS</span>
            <br />
            量化品牌 AI 基礎設施系統
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            你的 CMO 上週又被問「為什麼 ChatGPT 沒提到我們?」嗎?
            <br />
            Symcio 跨四引擎量化品牌曝光,3 分鐘看見 AI 怎麼描述你。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-card bg-accent px-7 py-3.5 text-sm font-bold text-white no-underline hover:bg-accent-dim transition"
            >
              免費品牌 AI 健檢 →
            </Link>
            <a
              href="https://discord.gg/jGWJr2Sd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-card border border-line px-7 py-3.5 text-sm font-bold text-ink no-underline hover:border-accent hover:text-accent"
            >
              💬 Discord 社群
            </a>
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-card border border-line px-7 py-3.5 text-sm font-bold text-ink no-underline hover:border-accent hover:text-accent"
            >
              🐙 GitHub 協作
            </a>
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
            Symcio 定義的核心指標 — 把金融資本、AI 可見度、品牌參與度三個原本不相關的市場統一成單一時序。
          </p>

          <div className="mt-8 rounded-card border border-accent/30 bg-accent p-8 md:p-10">
            <div className="text-center font-mono text-xl md:text-2xl text-white">
              BCI = α · FBV + β · NCV + γ · AIV
            </div>
            <div className="mt-3 text-center font-mono text-xs text-white/70">
              α = 0.50 · β = 0.25 · γ = 0.25
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-card border border-line bg-surface p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-accent">
                FBV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                Financial Brand Value
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                依循 ISO 10668 財務精神;整合營收、公司規模、產業品牌角色指數、品牌強度。
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-excellent">
                NCV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                Nature Capital Value
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                基於 TNFD LEAP 框架;結合產業自然依賴度基準與 Biocredit 估算。
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-warning">
                AIV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                AI Visibility Value
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Symcio 獨創;跨 ChatGPT (35%) / Perplexity (25%) / Google AI (25%) / Claude (15%) 加權提及率。
              </p>
            </div>
          </div>

          <p className="mt-6 font-mono text-xs text-muted">
            框架精神參考 ISO 10668 國際品牌評價標準 · 方法論開源於{" "}
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              github.com/sall911/symcio
            </a>
            <br />
            BCI 為觀察性指標,不構成品牌估值意見書、投資建議或財務報告。
          </p>
        </div>
      </section>

      {/* Service modules */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Service Modules
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            六個核心服務模組
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div
                key={m.code}
                className="rounded-card border border-line bg-surface p-6 transition hover:border-accent hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
                    Module {m.code}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold">{m.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {m.desc}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                  {m.metrics.map((x) => (
                    <li
                      key={x}
                      className="rounded-full border border-line px-3 py-1 font-mono text-muted"
                    >
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
                亞太 ESG 資料庫合作夥伴（洽談中）;資料層整合進 NCV 分軸。
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
                BCI 方法論白皮書、TNFD / LEAP 在地化框架、AI 治理立法觀察、
                ESG 揭露時程分析。所有研究產出以 CC BY 4.0 授權,供主管機關、
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
                  title: "TNFD LEAP 在地化指南（製造業）",
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
