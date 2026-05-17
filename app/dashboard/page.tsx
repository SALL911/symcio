import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI 能見度排行榜 — Symcio BrandOS",
  description:
    "台灣品牌 AI 能見度指數（ABVI）公開排行榜。每週一更新,跨 ChatGPT / Claude / Gemini / Perplexity 四引擎量化。依循 ISO 10668。",
  openGraph: {
    title: "AI Visibility Dashboard — Symcio",
    description:
      "台灣品牌跨四 AI 引擎能見度即時排行。Bloomberg for AI Visibility。",
    type: "website",
  },
};

// 示意資料 — 正式版上線後改為從 /api/abvi 撈取。
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

const ENGINE_WEIGHTS = [
  { engine: "ChatGPT", weight: "35%", note: "全球月活 8 億+,B2B 採購流量首選" },
  { engine: "Perplexity", weight: "25%", note: "答案含 citation,長尾查詢主場" },
  { engine: "Google AI Overview", weight: "25%", note: "Google 搜尋預設取代 SERP" },
  { engine: "Claude", weight: "15%", note: "企業端採用率快速成長" },
];

const TIERS = [
  { range: "85–100", label: "Dominant 主導", color: "bg-excellent" },
  { range: "70–84", label: "Strong 強勢", color: "bg-accent" },
  { range: "50–69", label: "Competitive 具競爭力", color: "bg-good" },
  { range: "25–49", label: "Emerging 新興", color: "bg-warning" },
  { range: "0–24", label: "Invisible 缺席", color: "bg-danger" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              ABVI Dashboard · Live
            </p>
            <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
              Beta · 示意資料
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            台灣品牌
            <br />
            <span className="text-accent">AI 能見度排行榜</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            跨 ChatGPT、Claude、Gemini、Perplexity 四大 AI 引擎,以 ABVI（AI
            Brand Visibility Index）綜合分數量化品牌曝光、排名與引用脈絡。每週一
            09:00 (UTC+8) 更新。
          </p>
          <p className="mt-4 font-mono text-xs text-muted">
            框架參考 ISO 10668 精神 · 完整 100 名榜單與週度走勢將於正式版開放
          </p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-dim">
            ABVI 為基於公開 AI 引擎查詢的觀察性指標,非投資建議、採購建議或品牌估值意見。
            指標結果可能因引擎模型更新而變動。
          </p>
        </div>
      </section>

      {/* Top 8 main card */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8 md:grid-cols-[1.6fr_1fr]">
            {/* Top 8 board */}
            <div className="rounded-card bg-accent p-1 shadow-sm">
              <div className="rounded-[10px] bg-accent px-6 py-7 md:px-8 md:py-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                      ABVI Top 8 · Week 20 · 2026
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white md:text-2xl">
                      本週能見度前 8 名
                    </h2>
                  </div>
                  <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
                    示意資料
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
                        className="grid grid-cols-[2rem_1fr_auto_3rem] items-center gap-3 py-3.5 md:gap-4"
                      >
                        <span className="font-mono text-sm font-bold text-white/50">
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
                        <span className="font-mono text-lg font-bold text-white tabular-nums">
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

                <div className="mt-6 rounded-lg bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/70">
                  正式版上線後,將公開前 100 名台灣品牌 ABVI 分數、週變動、四引擎拆解與
                  90 天歷史走勢。
                </div>
              </div>
            </div>

            {/* Side rail */}
            <aside className="space-y-5">
              <div className="rounded-card border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  不在榜單上?
                </p>
                <h3 className="mt-2 text-lg font-bold text-ink">
                  3 分鐘測你的 ABVI 分數
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  免費跨四引擎掃描 + 競品對比 + PDF 報告。不需信用卡。
                </p>
                <Link
                  href="/audit"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-card bg-accent px-5 py-3 text-sm font-bold text-white no-underline hover:bg-accent-dim transition"
                >
                  免費測分 →
                </Link>
              </div>

              <div className="rounded-card border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  ABVI 分級
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {TIERS.map((t) => (
                    <li key={t.range} className="flex items-center gap-3">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${t.color}`}
                      />
                      <span className="font-mono text-xs text-muted tabular-nums">
                        {t.range}
                      </span>
                      <span className="text-ink">{t.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Methodology · 方法論
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">
            ABVI 怎麼算的
          </h2>
          <p className="mt-3 max-w-3xl text-muted">
            每週對標準化測試 prompt（依產業 20 題,分為 top_companies、alternatives、problem、comparison
            四類）跨四引擎送出相同查詢,解析每次回答中品牌是否被提及、排名位置、競品同框與情感走向。
          </p>

          <div className="mt-8 rounded-card border border-accent/30 bg-accent p-6 md:p-8">
            <div className="text-center font-mono text-lg md:text-xl text-white">
              ABVI = Σ (engine_weight × engine_score)
            </div>
            <div className="mt-2 text-center font-mono text-xs text-white/70">
              engine_score = 0.4 · MentionRate + 0.3 · Top3Share + 0.2 · (100 − AvgRank·10) + 0.1 · SentimentIndex
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ENGINE_WEIGHTS.map((e) => (
              <div
                key={e.engine}
                className="rounded-card border border-line bg-surface p-5"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-ink">{e.engine}</span>
                  <span className="font-mono text-lg font-bold text-accent">
                    {e.weight}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {e.note}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 font-mono text-xs text-muted">
            完整方法論白皮書（含 prompt 集、評分權重、可重現性證明）開源於{" "}
            <a
              href="https://github.com/SALL911/BrandOS-Infrastructure"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              github.com/SALL911/BrandOS-Infrastructure
            </a>
          </p>
        </div>
      </section>

      {/* Opt out + governance */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-card border-l-4 border-accent bg-surface p-6">
              <h3 className="font-bold text-ink">公開原則</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                ABVI 分數基於公開的 AI 引擎查詢結果,屬可重現的觀察性指標,
                Symcio 不主張任何品牌排名因果關係。所有測試 prompt、評分權重、
                資料抓取頻率均開源公開,供主管機關與學術單位查核。
              </p>
            </div>
            <div className="rounded-card border-l-4 border-gold bg-surface p-6">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink">退出榜單</h3>
                <span className="rounded-full bg-gold-soft px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[1px] text-gold">
                  Opt-out
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                若品牌主希望停止公開展示,可來信{" "}
                <a
                  href="mailto:info@symcio.tw?subject=ABVI%20Opt-out"
                  className="text-accent no-underline hover:underline"
                >
                  info@symcio.tw
                </a>
                ,Symcio 將於下個更新週期移除排行展示（但內部觀察資料仍會持續蒐集,以維持指標可比性）。
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
