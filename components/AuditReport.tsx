"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  BarElement,
} from "chart.js";
import { useMemo, useRef } from "react";
import { Bar, Radar } from "react-chartjs-2";
import { bciTier, type ScoringResult } from "@/lib/scoring";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

const GEO_LABELS: Record<string, string> = {
  schemaOrg: "Schema.org 結構化資料",
  wikidata: "Wikidata 品牌實體",
  knowledgePanel: "Google Knowledge Panel",
  linkedin: "LinkedIn 公司頁面",
  ssl: "SSL 憑證",
};

const ENGINES = [
  { key: "chatgptScore", name: "ChatGPT", color: "#2dd4a0" },
  { key: "perplexityScore", name: "Perplexity", color: "#378ADD" },
  { key: "googleAIScore", name: "Google AI", color: "#fbbf24" },
  { key: "claudeScore", name: "Claude", color: "#c084fc" },
] as const;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AuditReport({ result }: { result: ScoringResult }) {
  const tier = bciTier(result.BCI);
  const pdfRef = useRef<HTMLDivElement>(null);

  const radarData = useMemo(
    () => ({
      labels: [
        "財務品牌價值 (FBV)",
        "自然資本價值 (NCV)",
        "AI 可見度 (AIV)",
      ],
      datasets: [
        {
          label: result.brandName,
          data: [result.FBV, result.NCV, result.AIV],
          backgroundColor: "rgba(200, 245, 90, 0.18)",
          borderColor: "#c8f55a",
          borderWidth: 2,
          pointBackgroundColor: "#c8f55a",
          pointBorderColor: "#0a0a0a",
          pointRadius: 5,
        },
      ],
    }),
    [result],
  );

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: { color: "rgba(255,255,255,0.08)" },
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: {
          color: "#9ca3af",
          backdropColor: "transparent",
          stepSize: 20,
        },
        pointLabels: {
          color: "#f5f5f5",
          font: { size: 13, weight: 600 as const },
        },
      },
    },
  };

  const competitorLabels = [
    result.brandName,
    ...result.competitors.map((c) => c.name),
  ];
  const competitorScores = [
    result.AIV,
    ...result.competitors.map((c) => c.score),
  ];
  const barData = {
    labels: competitorLabels,
    datasets: [
      {
        data: competitorScores,
        backgroundColor: competitorLabels.map((_, i) =>
          i === 0 ? "#c8f55a" : "rgba(200,200,200,0.35)",
        ),
        borderColor: competitorLabels.map((_, i) =>
          i === 0 ? "#c8f55a" : "rgba(200,200,200,0.55)",
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };
  const barOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: { color: "#9ca3af" },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#f5f5f5",
          font: { size: 13, weight: 600 as const },
        },
      },
    },
  };

  async function downloadPdf() {
    try {
      const mod = (await import("html2pdf.js")) as unknown as {
        default: (...args: unknown[]) => {
          set: (opt: unknown) => {
            from: (el: HTMLElement) => { save: () => Promise<void> };
          };
        };
      };
      const html2pdf = mod.default;
      const el = pdfRef.current;
      if (!el) return;

      try {
        const g = (
          globalThis as unknown as { gtag?: (...args: unknown[]) => void }
        ).gtag;
        if (typeof g === "function")
          g("event", "pdf_download", { brand: result.brandName });
      } catch {
        /* ignore */
      }

      const filename = `${result.brandName}_AI品牌可見度報告_${today()}.pdf`;
      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(el)
        .save();
    } catch (err) {
      alert("PDF 生成失敗，請稍候再試。");
      console.error(err);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="border-b border-line pb-6 pt-2">
          <div className="font-mono text-xs text-muted">
            報告日期 {today()} · 產業 {result.industry}
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {result.brandName} 品牌 AI 可見度診斷報告
          </h2>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
            依循 ISO 10668 · BCI v2 methodology
          </div>
        </div>

        {/* Section 1 — BCI ring */}
        <Section num={1} title="BCI 品牌資本指數">
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative flex h-60 w-60 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${tier.color} ${result.BCI}%, #262626 0)`,
              }}
            >
              <div className="absolute inset-[14px] rounded-full bg-ink" />
              <div className="relative z-10 text-center">
                <div className="font-mono text-5xl font-bold text-white">
                  {result.BCI}
                </div>
                <div className="mt-1 text-sm text-muted">/ 100</div>
              </div>
            </div>
            <div
              className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[1px]"
              style={{
                background: tier.color,
                color:
                  tier.key === "good" || tier.key === "danger"
                    ? "#fff"
                    : "#0a0a0a",
              }}
            >
              {tier.label}
            </div>
          </div>
        </Section>

        {/* Section 2 — Radar */}
        <Section num={2} title="BCI 三維分析">
          <h3 className="mb-4 text-xl font-bold text-white">
            FBV · NCV · AIV 三軸雷達
          </h3>
          <div className="mx-auto h-[360px] max-w-lg rounded-card border border-line bg-surface p-5">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </Section>

        {/* Section 3 — Engines */}
        <Section num={3} title="四大 AI 引擎評分">
          <h3 className="mb-4 text-xl font-bold text-white">
            跨引擎可見度分佈
          </h3>
          <div className="max-w-2xl space-y-4">
            {ENGINES.map((e) => {
              const score = (result as unknown as Record<string, number>)[
                e.key
              ] as number;
              return (
                <div key={e.key} className="flex items-center gap-3">
                  <div className="w-28 text-sm font-semibold">{e.name}</div>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full transition-[width] duration-1000 ease-out"
                      style={{
                        width: `${score}%`,
                        background: e.color,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right font-mono text-sm font-bold">
                    {score}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 4 — GEO */}
        <Section num={4} title="GEO 基礎建設檢查">
          <h3 className="mb-4 text-xl font-bold text-white">
            AI 看得懂你的品牌嗎？
          </h3>
          <ul className="grid gap-2.5">
            {Object.entries(result.geoChecks).map(([key, ok]) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5"
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    ok ? "bg-excellent text-ink" : "bg-line text-muted"
                  }`}
                >
                  {ok ? "✓" : "×"}
                </span>
                <span>{GEO_LABELS[key] ?? key}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-card border border-line bg-surface px-5 py-4 text-center font-bold">
            GEO 完整度：{result.geoScore} / 5
          </div>
        </Section>

        {/* Section 5 — Competitors */}
        <Section num={5} title="同產業競品 AI 可見度比較">
          <div className="h-[280px] max-w-3xl rounded-card border border-line bg-surface p-5">
            <Bar data={barData} options={barOptions} />
          </div>
        </Section>

        {/* Section 6 — Recommendations */}
        <Section num={6} title="改善建議與行動計畫">
          <h3 className="mb-4 text-xl font-bold text-white">
            優先順序由 BCI 算法排序
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {result.recommendations.map((r, i) => {
              const cls =
                r.priority === "高"
                  ? "bg-danger text-white"
                  : r.priority === "中"
                    ? "bg-warning text-ink"
                    : "bg-good text-white";
              return (
                <div
                  key={i}
                  className="rounded-card border border-line bg-surface p-6"
                >
                  <span
                    className={`mb-3 inline-block rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[1px] ${cls}`}
                  >
                    優先度：{r.priority}
                  </span>
                  <h4 className="text-base font-bold text-white">{r.title}</h4>
                  <p className="mt-2 text-sm text-muted">{r.desc}</p>
                  <div className="mt-3 text-sm font-semibold text-accent">
                    → {r.action}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 7 — Methodology */}
        <Section num={7} title="方法論說明">
          <details className="rounded-card border border-line bg-surface p-6">
            <summary className="cursor-pointer font-semibold text-white">
              BCI 方法論、權重與依據
            </summary>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <div className="rounded-lg bg-ink p-4 font-mono text-sm text-accent">
                BCI = α · FBV + β · NCV + γ · AIV &nbsp; (α=0.50, β=0.25,
                γ=0.25)
              </div>
              <p>
                <b className="text-white">FBV · Financial Brand Value</b>：依循
                ISO 10668 財務精神，整合營收、公司規模、產業品牌角色指數 (Brand
                Role Index)、品牌強度。
              </p>
              <p>
                <b className="text-white">NCV · Nature Capital Value</b>：基於
                TNFD LEAP 框架，結合產業自然依賴度基準與 biocredit 估算。
              </p>
              <p>
                <b className="text-white">AIV · AI Visibility Value</b>：Symcio
                獨創；跨 ChatGPT (35%) / Perplexity (25%) / Google AI (25%) /
                Claude (15%) 加權提及率。
              </p>
              <p>
                本頁分數為 MVP v2 演算生成；生產環境會串接真實 API 結果。
                方法論見{" "}
                <a
                  href="https://github.com/sall911/symcio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  github.com/sall911/symcio
                </a>
                。
              </p>
            </div>
          </details>
        </Section>

        {/* Section 8 — CTA */}
        <Section num={8} title="下一步">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <button
              onClick={downloadPdf}
              className="rounded-card bg-accent px-6 py-3 text-sm font-semibold text-ink hover:scale-[1.02]"
            >
              📄 下載 PDF 報告
            </button>
            <a
              href="/pricing"
              className="rounded-card border border-line-soft px-6 py-3 text-center text-sm font-semibold text-white no-underline hover:border-accent hover:text-accent"
            >
              🔓 解鎖進階分析
            </a>
            <a
              href="https://discord.gg/jGWJr2Sd"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-line-soft px-6 py-3 text-center text-sm font-semibold text-white no-underline hover:border-accent hover:text-accent"
            >
              💬 加入 Discord
            </a>
            <a
              href="mailto:sall@symcio.tw?subject=品牌AI可見度諮詢"
              className="rounded-card border border-line-soft px-6 py-3 text-center text-sm font-semibold text-white no-underline hover:border-accent hover:text-accent"
            >
              📞 預約顧問諮詢
            </a>
          </div>
        </Section>
      </div>

      {/* Hidden PDF content — rendered offscreen for html2pdf */}
      <div
        ref={pdfRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
          width: "794px",
          background: "#fff",
          color: "#0a0a0a",
          padding: "40px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <PdfContent result={result} />
      </div>
    </>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-12">
      <div className="mb-4 font-mono text-xs font-bold uppercase tracking-[2px] text-accent">
        {num} · {title}
      </div>
      {children}
    </section>
  );
}

function PdfContent({ result }: { result: ScoringResult }) {
  const tier = bciTier(result.BCI);
  const geoList: [string, boolean][] = [
    ["Schema.org 結構化資料", result.geoChecks.schemaOrg],
    ["Wikidata 品牌實體", result.geoChecks.wikidata],
    ["Google Knowledge Panel", result.geoChecks.knowledgePanel],
    ["LinkedIn 公司頁面", result.geoChecks.linkedin],
    ["SSL 憑證", result.geoChecks.ssl],
  ];
  return (
    <div>
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#0a0a0a",
            marginBottom: 8,
          }}
        >
          SYMCIO
        </div>
        <div
          style={{
            fontSize: 14,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#666",
            marginBottom: 64,
          }}
        >
          Brand AI Audit
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
          品牌 AI 可見度診斷報告
        </h1>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
          {result.brandName}
        </div>
        <div style={{ color: "#666", fontSize: 14 }}>
          {result.industry} · 報告日期 {today()}
        </div>
        <div
          style={{
            marginTop: 100,
            padding: 20,
            border: "1px solid #ccc",
          }}
        >
          <div
            style={{ fontSize: 12, color: "#666", letterSpacing: 1 }}
          >
            BCI TOTAL SCORE
          </div>
          <div
            style={{ fontSize: 64, fontWeight: 700, color: "#0a0a0a" }}
          >
            {result.BCI}
            <span style={{ fontSize: 24, color: "#666" }}>/100</span>
          </div>
          <div style={{ fontSize: 16, color: "#666" }}>
            評等：{tier.label}
          </div>
        </div>
      </div>

      <div style={{ pageBreakAfter: "always", padding: "30px 0" }}>
        <h2
          style={{
            fontSize: 18,
            borderBottom: "2px solid #0a0a0a",
            paddingBottom: 6,
            marginBottom: 16,
          }}
        >
          一、BCI 三維分析
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={td()}>維度</th>
              <th style={td()}>分數</th>
              <th style={td()}>說明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td()}>FBV · 財務品牌價值</td>
              <td style={td()}>{result.FBV}/100</td>
              <td style={td()}>ISO 10668 財務法；整合營收、規模、品牌角色。</td>
            </tr>
            <tr>
              <td style={td()}>NCV · 自然資本價值</td>
              <td style={td()}>{result.NCV}/100</td>
              <td style={td()}>TNFD LEAP 框架；產業自然依賴 + biocredit。</td>
            </tr>
            <tr>
              <td style={td()}>AIV · AI 可見度價值</td>
              <td style={td()}>{result.AIV}/100</td>
              <td style={td()}>跨四引擎加權提及率。</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ pageBreakAfter: "always", padding: "30px 0" }}>
        <h2
          style={{
            fontSize: 18,
            borderBottom: "2px solid #0a0a0a",
            paddingBottom: 6,
            marginBottom: 16,
          }}
        >
          二、四大 AI 引擎分數
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={td()}>引擎</th>
              <th style={td()}>分數</th>
              <th style={td()}>權重</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td()}>ChatGPT</td>
              <td style={td()}>{result.chatgptScore}/100</td>
              <td style={td()}>35%</td>
            </tr>
            <tr>
              <td style={td()}>Perplexity</td>
              <td style={td()}>{result.perplexityScore}/100</td>
              <td style={td()}>25%</td>
            </tr>
            <tr>
              <td style={td()}>Google AI</td>
              <td style={td()}>{result.googleAIScore}/100</td>
              <td style={td()}>25%</td>
            </tr>
            <tr>
              <td style={td()}>Claude</td>
              <td style={td()}>{result.claudeScore}/100</td>
              <td style={td()}>15%</td>
            </tr>
          </tbody>
        </table>
        <h2
          style={{
            fontSize: 18,
            borderBottom: "2px solid #0a0a0a",
            paddingBottom: 6,
            margin: "24px 0 16px",
          }}
        >
          三、GEO 基礎建設檢查（{result.geoScore}/5）
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {geoList.map(([name, ok]) => (
              <tr key={name}>
                <td style={td()}>{name}</td>
                <td style={td()}>{ok ? "✓ 通過" : "✗ 待優化"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ pageBreakAfter: "always", padding: "30px 0" }}>
        <h2
          style={{
            fontSize: 18,
            borderBottom: "2px solid #0a0a0a",
            paddingBottom: 6,
            marginBottom: 16,
          }}
        >
          四、同產業競品 AI 可見度比較
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={td()}>
                <b>{result.brandName}（您的品牌）</b>
              </td>
              <td style={td()}>{result.AIV}/100</td>
            </tr>
            {result.competitors.map((c) => (
              <tr key={c.name}>
                <td style={td()}>{c.name}</td>
                <td style={td()}>{c.score}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "30px 0" }}>
        <h2
          style={{
            fontSize: 18,
            borderBottom: "2px solid #0a0a0a",
            paddingBottom: 6,
            marginBottom: 16,
          }}
        >
          五、改善建議
        </h2>
        {result.recommendations.map((r, i) => (
          <div
            key={i}
            style={{
              marginBottom: 16,
              padding: 12,
              borderLeft: "3px solid #c8f55a",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#666",
                marginBottom: 4,
              }}
            >
              優先度：{r.priority}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              {i + 1}. {r.title}
            </div>
            <div
              style={{ fontSize: 13, color: "#333", marginBottom: 6 }}
            >
              {r.desc}
            </div>
            <div style={{ fontSize: 12, color: "#0a0a0a" }}>
              <b>行動建議：</b>
              {r.action}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 10,
            color: "#666",
          }}
        >
          本報告由 Symcio Brand Capital Index (BCI) 方法論生成 · 依循 ISO 10668
          · CONFIDENTIAL
        </div>
      </div>
    </div>
  );
}

function td(): React.CSSProperties {
  return {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "left",
    fontSize: 12,
  };
}
