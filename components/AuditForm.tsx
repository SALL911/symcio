"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  bciTier,
  calculateBCI,
  COMPANY_SIZES,
  INDUSTRIES,
  REVENUES,
  type CompanySize,
  type Industry,
  type Revenue,
  type ScoringResult,
} from "@/lib/scoring";
import { getAttribution } from "@/lib/utm/capture";

const AuditReport = dynamic(() => import("./AuditReport"), { ssr: false });

type FormState = {
  brandNameZh: string;
  brandNameEn: string;
  website: string;
  industry: Industry | "";
  description: string;
  companySize: CompanySize | "";
  revenue: Revenue;
  email: string;
  contactName: string;
  title: string;
};

const INIT: FormState = {
  brandNameZh: "",
  brandNameEn: "",
  website: "",
  industry: "",
  description: "",
  companySize: "",
  revenue: "不方便透露",
  email: "",
  contactName: "",
  title: "",
};

const STAGES = [
  { pct: 18, text: "掃描 AI 搜尋引擎資料庫…", ms: 2000 },
  { pct: 36, text: "分析品牌在 ChatGPT 的提及率…", ms: 2000 },
  { pct: 50, text: "分析品牌在 Perplexity 的引用頻率…", ms: 1000 },
  { pct: 72, text: "比對同產業競品 AI 可見度…", ms: 2000 },
  { pct: 92, text: "計算 BCI 品牌資本指數…", ms: 2000 },
  { pct: 100, text: "報告生成完成 ✓", ms: 1000 },
];

function ga(name: string, params?: Record<string, unknown>) {
  try {
    const g = (globalThis as unknown as { gtag?: (...args: unknown[]) => void })
      .gtag;
    if (typeof g === "function") g("event", name, params || {});
  } catch {
    /* ignore */
  }
}

export default function AuditForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(INIT);
  const [diagActive, setDiagActive] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canStep2 = useMemo(
    () =>
      form.brandNameZh.trim() &&
      form.brandNameEn.trim() &&
      form.website.trim() &&
      form.industry,
    [form],
  );

  function toStep2() {
    if (!canStep2) return;
    setStep(2);
    ga("form_step2", { industry: form.industry });
  }

  function runDiagnostic(): Promise<void> {
    return new Promise((resolve) => {
      setDiagActive(true);
      setStageIdx(0);
      let i = 0;
      const run = () => {
        if (i >= STAGES.length) {
          setTimeout(() => {
            setDiagActive(false);
            resolve();
          }, 300);
          return;
        }
        setStageIdx(i);
        setTimeout(() => {
          i++;
          run();
        }, STAGES[i].ms);
      };
      run();
    });
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!form.industry || !form.companySize || !form.email) return;
    ga("form_submit", {
      industry: form.industry,
      brand: form.brandNameZh,
    });

    await runDiagnostic();

    const r = calculateBCI({
      brandNameZh: form.brandNameZh,
      brandNameEn: form.brandNameEn,
      website: form.website,
      industry: form.industry,
      description: form.description,
      companySize: form.companySize,
      revenue: form.revenue,
    });
    setResult(r);
    const tier = bciTier(r.BCI);
    ga("report_view", { brand: r.brandName, bci: r.BCI, tier: tier.key });

    // Silent lead capture → leads 表（含 UTM 歸因）。Fire-and-forget，不擋 UI。
    try {
      fetch("/api/audit-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name_zh: form.brandNameZh,
          brand_name_en: form.brandNameEn,
          website: form.website,
          industry: form.industry,
          company_size: form.companySize,
          revenue: form.revenue,
          email: form.email,
          contact_name: form.contactName,
          title: form.title,
          bci: r.BCI,
          tier: tier.key,
          attribution: getAttribution(),
        }),
        keepalive: true,
      }).catch(() => {
        /* lead 失敗不影響使用者看報告 */
      });
    } catch {
      /* ignore */
    }

    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }

  return (
    <>
      {/* Diagnostic overlay */}
      {diagActive && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 p-6 backdrop-blur">
          <div className="mb-8 flex h-18 w-18 animate-spin-slow items-center justify-center rounded-2xl bg-accent text-4xl font-extrabold text-ink">
            S
          </div>
          <div className="mb-5 min-h-[28px] text-center text-lg text-white">
            {STAGES[stageIdx]?.text ?? ""}
          </div>
          <div className="h-1.5 w-[min(480px,90%)] overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-gradient-to-r from-accent to-excellent transition-all duration-500"
              style={{ width: `${STAGES[stageIdx]?.pct ?? 0}%` }}
            />
          </div>
          <div className="mt-3 font-mono text-xs text-muted">
            {STAGES[stageIdx]?.pct ?? 0}%
          </div>
        </div>
      )}

      {!result && (
        <div className="mx-auto max-w-2xl rounded-card border border-line bg-surface p-8 md:p-10">
          <div className="mb-6 flex gap-2">
            <div
              className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-accent" : "bg-line"}`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-accent" : "bg-line"}`}
            />
          </div>

          <form onSubmit={onSubmit}>
            {step === 1 && (
              <div>
                <h3 className="mb-5 text-lg font-semibold text-white">
                  Step 1 · 品牌資料
                </h3>

                <Field label="品牌中文名稱 *">
                  <input
                    type="text"
                    value={form.brandNameZh}
                    onChange={(e) => update("brandNameZh", e.target.value)}
                    placeholder="例：鮮乳坊"
                    required
                    className="form-input"
                  />
                </Field>

                <Field label="品牌英文名稱 *">
                  <input
                    type="text"
                    value={form.brandNameEn}
                    onChange={(e) => update("brandNameEn", e.target.value)}
                    placeholder="例：Xian Nai Fang"
                    required
                    className="form-input"
                  />
                </Field>

                <Field label="官方網站 URL *">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://"
                    required
                    className="form-input"
                  />
                </Field>

                <Field label="產業類別 *">
                  <select
                    value={form.industry}
                    onChange={(e) =>
                      update("industry", e.target.value as Industry)
                    }
                    required
                    className="form-input"
                  >
                    <option value="">請選擇…</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </Field>

                <Field label="品牌一句話描述">
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="用一句話描述品牌做什麼"
                    className="form-input min-h-[72px]"
                  />
                </Field>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={toStep2}
                    disabled={!canStep2}
                    className="rounded-card bg-accent px-7 py-3 text-sm font-semibold text-ink transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    下一步 →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="mb-5 text-lg font-semibold text-white">
                  Step 2 · 企業資料
                </h3>

                <Field label="公司規模 *">
                  <select
                    value={form.companySize}
                    onChange={(e) =>
                      update("companySize", e.target.value as CompanySize)
                    }
                    required
                    className="form-input"
                  >
                    <option value="">請選擇…</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>

                <Field label="年營收">
                  <select
                    value={form.revenue}
                    onChange={(e) =>
                      update("revenue", e.target.value as Revenue)
                    }
                    className="form-input"
                  >
                    {REVENUES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Email *">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="form-input"
                  />
                </Field>

                <Field label="姓名 *">
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    required
                    className="form-input"
                  />
                </Field>

                <Field label="職稱">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="選填"
                    className="form-input"
                  />
                </Field>

                <div className="mt-6 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-card border border-line-soft px-5 py-3 text-sm font-semibold text-white hover:border-accent hover:text-accent"
                  >
                    ← 上一步
                  </button>
                  <button
                    type="submit"
                    className="rounded-card bg-accent px-7 py-3 text-sm font-semibold text-ink transition hover:scale-[1.02]"
                  >
                    開始 AI 診斷 →
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {result && (
        <div ref={reportRef}>
          <AuditReport result={result} />
        </div>
      )}

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #f5f5f5;
          font-family: inherit;
          font-size: 15px;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: #c8f55a;
        }
        .animate-spin-slow {
          animation: diagSpin 2.5s linear infinite;
        }
        @keyframes diagSpin {
          0%,
          45% {
            transform: rotate(0);
          }
          50%,
          95% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
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
    <label className="mb-4 block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[1px] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
