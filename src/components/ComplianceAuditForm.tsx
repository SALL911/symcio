"use client";

import { FormEvent, useState } from "react";
import { getAttribution } from "@/lib/utm/capture";

type Status = "idle" | "submitting" | "success" | "error";

interface AuditReport {
  generated_at: string;
  company: string;
  category: string;
  markets: string[];
  exposure_summary: string;
  framework_mapping: Array<{
    framework: string;
    relevance: "high" | "medium" | "low" | "n/a";
    note: string;
  }>;
  three_actions: Array<{ priority: 1 | 2 | 3; action: string; reason: string }>;
  disclaimer: string;
}

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "consumer-electronics", label: "消費性電子" },
  { value: "textile-apparel", label: "紡織 / 服飾" },
  { value: "food-beverage", label: "食品 / 飲料" },
  { value: "cosmetics-personal-care", label: "美妝 / 個人護理" },
  { value: "industrial-manufacturing", label: "工業製造 / 機械" },
  { value: "b2b-saas", label: "B2B SaaS / 軟體" },
  { value: "financial-services", label: "金融服務" },
  { value: "healthcare-biotech", label: "醫療 / 生技" },
  { value: "retail-ecommerce", label: "零售 / 電商" },
  { value: "other", label: "其他" },
];

const MARKETS: Array<{ value: string; label: string }> = [
  { value: "EU", label: "歐盟 EU" },
  { value: "US", label: "美國 US" },
  { value: "UK", label: "英國 UK" },
  { value: "JP", label: "日本 JP" },
  { value: "KR", label: "韓國 KR" },
  { value: "SG", label: "新加坡 SG" },
  { value: "TW", label: "台灣 TW" },
  { value: "APAC", label: "其他亞太" },
];

const RELEVANCE_STYLE: Record<string, string> = {
  high: "bg-danger/15 text-danger border-danger/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-good/15 text-good border-good/30",
  "n/a": "bg-line text-muted border-line",
};

const RELEVANCE_LABEL: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
  "n/a": "N/A",
};

export function ComplianceAuditForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [markets, setMarkets] = useState<string[]>(["EU"]);

  function toggleMarket(m: string) {
    setMarkets((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      company_name: String(form.get("company_name") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      markets,
      email: String(form.get("email") ?? "").trim(),
      display_name: String(form.get("display_name") ?? "").trim() || undefined,
      role: String(form.get("role") ?? "").trim() || undefined,
      attribution: getAttribution(),
    };

    if (!payload.company_name || !payload.category || markets.length === 0 || !payload.email) {
      setStatus("error");
      setError("請填寫公司名、品類、至少 1 個市場、有效 email");
      return;
    }

    try {
      const res = await fetch("/api/compliance-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { ok: boolean; report?: AuditReport; error?: string; message?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(`伺服器回應異常(HTTP ${res.status})`);
      }

      if (!res.ok || !data || !data.ok || !data.report) {
        throw new Error(data?.message ?? data?.error ?? `HTTP ${res.status}`);
      }

      setReport(data.report);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "提交失敗");
    }
  }

  if (status === "success" && report) {
    return (
      <div className="space-y-6">
        <div className="rounded-card border border-accent bg-accent-soft p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            ✓ 評估完成 · 報告已寄到你的信箱
          </p>
          <h2 className="mt-2 text-xl font-bold text-ink">
            {report.company} · 合規曝險評估
          </h2>
          <p className="mt-2 font-mono text-xs text-muted">
            {report.category} · {report.markets.join(" / ")} ·{" "}
            {report.generated_at.slice(0, 10)}
          </p>
        </div>

        <section className="rounded-card border border-line bg-surface p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            曝險摘要
          </h3>
          <p className="mt-3 text-sm leading-[1.85] text-ink md:text-base">
            {report.exposure_summary}
          </p>
        </section>

        <section className="rounded-card border border-line bg-surface p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            框架對照
          </h3>
          <ul className="mt-4 space-y-3">
            {report.framework_mapping.map((f) => (
              <li
                key={f.framework}
                className="flex flex-col gap-2 border-b border-line pb-3 last:border-0 sm:flex-row sm:items-start sm:gap-4"
              >
                <span className="font-semibold text-ink sm:w-48">
                  {f.framework}
                </span>
                <span
                  className={`inline-block w-fit rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] ${RELEVANCE_STYLE[f.relevance]}`}
                >
                  {RELEVANCE_LABEL[f.relevance]}
                </span>
                <span className="flex-1 text-sm text-muted">{f.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border border-line bg-surface p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            優先 3 個 Action
          </h3>
          <ol className="mt-4 space-y-4">
            {report.three_actions.map((a) => (
              <li key={a.priority} className="flex gap-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white">
                  {a.priority}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{a.action}</p>
                  <p className="mt-1 text-sm text-muted">{a.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="rounded-card border-l-4 border-gold bg-surface p-5 text-xs leading-relaxed text-muted">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
            免責聲明
          </p>
          <p className="mt-2">{report.disclaimer}</p>
        </div>

        <div className="rounded-card border border-line bg-surface-2 p-6 text-center">
          <p className="text-sm text-ink">
            想討論完整實作?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a
              href="/pricing"
              className="rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
            >
              查看方案
            </a>
            <a
              href="mailto:info@symcio.tw?subject=Compliance%20Pre-Audit%20%E5%BE%8C%E7%BA%8C%E8%A8%8E%E8%AB%96"
              className="rounded-card border border-line px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:border-accent hover:text-accent"
            >
              聯絡業務
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-line bg-surface p-6 md:p-8">
      <h2 className="text-xl font-bold text-ink">填寫公司資訊</h2>
      <p className="mt-2 text-sm text-muted">
        AI 會在 30–60 秒內產出評估。寄報告需要 email。
      </p>

      <div className="mt-6 space-y-5">
        <Field label="公司名稱 *">
          <input
            name="company_name"
            type="text"
            required
            placeholder="例:玉山金控"
            className="input"
          />
        </Field>

        <Field label="品類 *">
          <select name="category" required defaultValue="" className="input">
            <option value="" disabled>
              請選擇…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted">
            目標市場 *(可複選)
          </label>
          <div className="flex flex-wrap gap-2">
            {MARKETS.map((m) => {
              const active = markets.includes(m.value);
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleMarket(m.value)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-line text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email *">
            <input
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="input"
            />
          </Field>
          <Field label="姓名(選)">
            <input
              name="display_name"
              type="text"
              placeholder="你的名字"
              className="input"
            />
          </Field>
        </div>

        <Field label="職稱(選)">
          <input
            name="role"
            type="text"
            placeholder="CMO / 永續長 / IR / Other"
            className="input"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 inline-flex w-full items-center justify-center rounded-card bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50"
      >
        {status === "submitting" ? "AI 分析中(30–60 秒)…" : "生成曝險評估 →"}
      </button>

      {status === "error" && error && (
        <p className="mt-4 rounded-card border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          錯誤:{error}
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted-dim">
        送出即表示同意 Symcio 把 email 用於寄送本評估報告 + 未來相關內容。
        不轉售名單,可隨時退訂。
      </p>

      <style jsx>{`
        .input {
          display: block;
          width: 100%;
          border: 1px solid #e5e2d9;
          border-radius: 8px;
          background: #f7f6f3;
          padding: 0.7rem 0.9rem;
          color: #1a2e22;
          font-size: 0.9rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input::placeholder {
          color: #94a29a;
        }
        .input:focus {
          outline: none;
          border-color: #2a4d3a;
          box-shadow: 0 0 0 3px rgba(42, 77, 58, 0.12);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
