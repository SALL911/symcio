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
    desc: "追蹤品牌在 ChatGPT、Claude、Gemini、Perplexity 四引擎的曝光率、排名位置與情感趨勢。每日更新，可回溯 12 個月。",
    metrics: ["Mention Rate", "Average Rank", "Competitor Gap", "Sentiment"],
  },
  {
    code: "02",
    name: "ESG Compliance Engine",
    desc: "自動把 TNFD / GRI 2021 / IFRS S1-S2 / LEAP 資料結構化儲存，產出符合主管機關格式的永續報告書素材。",
    metrics: ["Scope 1/2/3", "TNFD Aligned", "GRI 2021", "IFRS S1/S2"],
  },
  {
    code: "03",
    name: "GEO Entity Builder",
    desc: "自動生成 Wikidata entity、Schema.org Organization JSON-LD、FAQPage Schema，讓 AI 引擎的知識圖譜正確認識你的品牌。",
    metrics: ["Wikidata", "Schema.org", "Knowledge Panel", "Entity Linking"],
  },
  {
    code: "04",
    name: "Brand Capital API",
    desc: "將品牌 AI 可見度、BCI 子分數、ESG 合規打包為 REST API，供內部 CRM、投資研究平台、Tableau / Power BI 直接取用。",
    metrics: ["REST API", "Webhook", "CSV Export", "SAML SSO"],
  },
  {
    code: "05",
    name: "TNFD / Biocredit",
    desc: "基於 TNFD LEAP 框架自動化自然資本評估、biocredit 估算、產業依賴度基準，整合進 NCV 分軸。",
    metrics: ["LEAP 四階段", "Biocredit", "NCV 評分", "自然資本時序"],
  },
  {
    code: "06",
    name: "運動產業 175% 抵稅",
    desc: "運動產業發展條例第 26-2 條合規支援 — 企業投資運動行銷、賽事贊助、運動科技可抵減營所稅至 175%，Symcio 提供投資量化佐證。",
    metrics: ["175% 抵減", "投資量化", "品牌成效", "稅務簽證"],
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
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
            整合 TNFD 框架、Biocredit 自然資本、AI 可見度追蹤 — 讓品牌資本可量化、可追蹤、可治理。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-card bg-accent px-7 py-3.5 text-sm font-bold text-ink no-underline hover:scale-[1.02] transition"
            >
              免費品牌 AI 健檢 →
            </Link>
            <a
              href="https://discord.gg/jGWJr2Sd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-card border border-line-soft px-7 py-3.5 text-sm font-bold text-white no-underline hover:border-accent hover:text-accent"
            >
              💬 Discord 社群
            </a>
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-card border border-line-soft px-7 py-3.5 text-sm font-bold text-white no-underline hover:border-accent hover:text-accent"
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
            從診斷到資本化的完整路徑。左列 ESG，右列 Capital / Sustainable governance，兩條治理軸貫穿四個板塊。
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
                  className={`relative rounded-card border ${tone} bg-surface p-6 transition hover:translate-y-[-2px] hover:border-accent`}
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
      <section className="border-b border-line bg-surface">
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

          <div className="mt-8 rounded-card border border-line bg-ink p-8 md:p-10">
            <div className="text-center font-mono text-xl md:text-2xl text-accent">
              BCI = α · FBV + β · NCV + γ · AIV
            </div>
            <div className="mt-3 text-center font-mono text-xs text-muted">
              α = 0.50 · β = 0.25 · γ = 0.25
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-card border border-line bg-ink p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-accent">
                FBV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                Financial Brand Value
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                依循 ISO 10668 財務精神；整合營收、公司規模、產業品牌角色指數、品牌強度。
              </p>
            </div>
            <div className="rounded-card border border-line bg-ink p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-excellent">
                NCV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                Nature Capital Value
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                基於 TNFD LEAP 框架；結合產業自然依賴度基準與 Biocredit 估算。
              </p>
            </div>
            <div className="rounded-card border border-line bg-ink p-6">
              <div className="font-mono text-[11px] uppercase tracking-[2px] text-warning">
                AIV
              </div>
              <h3 className="mt-2 text-lg font-bold">
                AI Visibility Value
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Symcio 獨創；跨 ChatGPT (35%) / Perplexity (25%) / Google AI (25%) / Claude (15%) 加權提及率。
              </p>
            </div>
          </div>

          <p className="mt-6 font-mono text-xs text-muted">
            依循 ISO 10668 國際品牌評價標準 · 方法論開源於{" "}
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              github.com/sall911/symcio
            </a>
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
                className="rounded-card border border-line bg-surface p-6 transition hover:border-accent"
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
                      className="rounded-full border border-line-soft px-3 py-1 font-mono text-muted"
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

      {/* Pricing preview */}
      <section className="border-b border-line bg-surface">
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
                className={`rounded-card border ${p.featured ? "border-accent" : "border-line"} bg-ink p-7 relative`}
              >
                {p.featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[1px] text-ink">
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
                    <li key={i} className="flex gap-2 text-white">
                      <span className="text-excellent">✓</span>
                      {i}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className={`mt-7 block rounded-card px-6 py-3 text-center text-sm font-semibold no-underline ${
                    p.featured
                      ? "bg-accent text-ink hover:scale-[1.02]"
                      : "border border-line-soft text-white hover:border-accent hover:text-accent"
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
              className="rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent"
            >
              <div className="text-3xl">💬</div>
              <h3 className="mt-3 text-lg font-bold text-white">Discord</h3>
              <p className="mt-2 text-sm text-muted">
                品牌長、ESG 永續長、AI SEO 社群每週互動；免費 office hour。
              </p>
              <div className="mt-4 font-mono text-xs text-accent">
                discord.gg/jGWJr2Sd →
              </div>
            </a>
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent"
            >
              <div className="text-3xl">🐙</div>
              <h3 className="mt-3 text-lg font-bold text-white">GitHub</h3>
              <p className="mt-2 text-sm text-muted">
                BCI 方法論、scoring engine、provider adapters 全開源；歡迎 PR。
              </p>
              <div className="mt-4 font-mono text-xs text-accent">
                github.com/sall911/symcio →
              </div>
            </a>
            <a
              href="https://esgpedia.io"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-line bg-surface p-6 no-underline transition hover:border-accent"
            >
              <div className="text-3xl">📚</div>
              <h3 className="mt-3 text-lg font-bold text-white">ESGpedia</h3>
              <p className="mt-2 text-sm text-muted">
                亞太 ESG 資料庫合作夥伴（洽談中）；資料層整合進 NCV 分軸。
              </p>
              <div className="mt-4 font-mono text-xs text-accent">
                esgpedia.io →
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-b border-line bg-accent text-ink">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            BrandOS Weekly
          </h2>
          <p className="mt-3 text-base text-ink/80">
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
              className="flex-1 rounded-card border border-ink/20 bg-ink/5 px-4 py-3 text-ink placeholder:text-ink/50 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-card bg-ink px-6 py-3 text-sm font-bold text-accent hover:scale-[1.02] transition"
            >
              訂閱 BrandOS Weekly
            </button>
          </form>
          <p className="mt-3 font-mono text-xs text-ink/60">
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
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
