"use client";

import { FormEvent, useMemo, useState } from "react";
import { BrandInput, EMPTY_INPUT, generate, OrgType } from "@/lib/schema/generator";
import { getAttribution } from "@/lib/utm/capture";

type SubmitState = "idle" | "submitting" | "success" | "error";

const ORG_TYPES: OrgType[] = [
  "Organization",
  "Corporation",
  "LocalBusiness",
  "EducationalOrganization",
  "GovernmentOrganization",
  "NGO",
];

export function SchemaWikidataGenerator() {
  const [input, setInput] = useState<BrandInput>(EMPTY_INPUT);
  const [sameAsRaw, setSameAsRaw] = useState("");
  const [submit, setSubmit] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const output = useMemo(() => {
    return generate({
      ...input,
      sameAs: sameAsRaw
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }, [input, sameAsRaw]);

  function set<K extends keyof BrandInput>(key: K, value: BrandInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmit("submitting");
    setSubmitError(null);

    if (!input.brandName.trim() || !input.email.trim()) {
      setSubmit("error");
      setSubmitError("品牌名稱與 email 必填（我們會把結構化檔案寄給你）。");
      return;
    }

    try {
      const res = await fetch("/api/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          sameAs: sameAsRaw
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean),
          attribution: getAttribution(),
        }),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSubmit("success");
    } catch (err) {
      setSubmit("error");
      setSubmitError(err instanceof Error ? err.message : "未知錯誤");
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="品牌名稱 *">
          <input
            required
            value={input.brandName}
            onChange={(e) => set("brandName", e.target.value)}
            placeholder="Symcio"
            className="input"
          />
        </Field>

        <Field label="法定名稱（選）">
          <input
            value={input.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            placeholder="Symcio Inc."
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="組織類型">
            <select
              value={input.orgType}
              onChange={(e) => set("orgType", e.target.value as OrgType)}
              className="input"
            >
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="產業">
            <input
              value={input.industry}
              onChange={(e) => set("industry", e.target.value)}
              placeholder="AI Visibility Intelligence"
              className="input"
            />
          </Field>
        </div>

        <Field label="官方網站">
          <input
            value={input.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://symcio.tw"
            className="input"
          />
        </Field>

        <Field label="Logo URL">
          <input
            value={input.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder="https://symcio.tw/logo.png"
            className="input"
          />
        </Field>

        <Field label="品牌描述（50–300 字，AI 會直接引用）">
          <textarea
            value={input.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            placeholder="Symcio 是台灣第一個 AI 曝光可量化系統，量化品牌在 ChatGPT、Claude、Gemini、Perplexity 的曝光、排名與影響力。"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="創立日期（YYYY 或 YYYY-MM-DD）">
            <input
              value={input.foundingDate}
              onChange={(e) => set("foundingDate", e.target.value)}
              placeholder="2024"
              className="input"
            />
          </Field>
          <Field label="國家（ISO alpha-2）">
            <input
              value={input.country}
              onChange={(e) => set("country", e.target.value.toUpperCase())}
              placeholder="TW"
              maxLength={2}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="城市">
            <input
              value={input.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Taipei"
              className="input"
            />
          </Field>
          <Field label="街道地址（選）">
            <input
              value={input.streetAddress}
              onChange={(e) => set("streetAddress", e.target.value)}
              placeholder=""
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email *">
            <input
              required
              type="email"
              value={input.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@company.com"
              className="input"
            />
          </Field>
          <Field label="電話（選）">
            <input
              value={input.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+886-2-0000-0000"
              className="input"
            />
          </Field>
        </div>

        <Field label="Wikidata QID（若已有，例：Q12345）">
          <input
            value={input.wikidataQid}
            onChange={(e) => set("wikidataQid", e.target.value.toUpperCase())}
            placeholder="Q12345"
            className="input"
          />
        </Field>

        <Field label="官方社群 / 資料庫連結（每行一個）">
          <textarea
            value={sameAsRaw}
            onChange={(e) => setSameAsRaw(e.target.value)}
            rows={4}
            placeholder={"https://www.linkedin.com/company/symcio\nhttps://x.com/symcio_tw\nhttps://github.com/symcio"}
            className="input"
          />
        </Field>

        <Field label="AI 可見度宣告（選，會成為 slogan 欄位）">
          <input
            value={input.aiVisibilityClaim}
            onChange={(e) => set("aiVisibilityClaim", e.target.value)}
            placeholder="台灣第一個 AI 曝光可量化系統"
            className="input"
          />
        </Field>

        {output.warnings.length > 0 && (
          <ul className="space-y-1 border border-line bg-white p-3 text-xs text-muted">
            {output.warnings.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={submit === "submitting"}
          className="w-full bg-ink px-6 py-4 text-base font-semibold text-white hover:bg-ink/90 disabled:opacity-50"
        >
          {submit === "submitting" ? "送出中..." : "寄給我 + 加入 Free Scan 排程 →"}
        </button>

        {submit === "success" && (
          <p className="border border-accent bg-accent/10 p-3 text-sm">
            已收到。我們會把 JSON-LD + QuickStatements 寄到 {input.email}，並把 {input.brandName} 加進四引擎曝光掃描佇列。
          </p>
        )}
        {submit === "error" && submitError && (
          <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            錯誤：{submitError}
          </p>
        )}
      </form>

      <div className="space-y-6">
        <Panel
          title="schema.org JSON-LD"
          note={'貼進官網 <head> 的 <script type="application/ld+json">。AI 引擎會用這個理解你的品牌實體。'}
          body={output.jsonLdString}
          onCopy={() => copy(output.jsonLdString)}
        />
        <Panel
          title="Wikidata QuickStatements"
          note="貼到 quickstatements.toolforge.org（選 v1 格式）。登入 Wikidata 後一鍵建立／更新條目。"
          body={output.quickStatements}
          onCopy={() => copy(output.quickStatements)}
        />
      </div>

      <style jsx>{`
        .input {
          display: block;
          width: 100%;
          border: 1px solid #e5e7eb;
          background: white;
          padding: 0.625rem 0.875rem;
          color: #0b0f19;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #0b0f19;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function Panel({
  title,
  note,
  body,
  onCopy,
}: {
  title: string;
  note: string;
  body: string;
  onCopy: () => void;
}) {
  return (
    <div className="border border-line">
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{title}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="border border-ink px-3 py-1 text-xs hover:bg-ink hover:text-white"
        >
          Copy
        </button>
      </div>
      <p className="border-b border-line bg-white px-4 py-2 text-xs text-muted">{note}</p>
      <pre className="max-h-96 overflow-auto bg-ink p-4 text-xs leading-relaxed text-white">
        {body}
      </pre>
    </div>
  );
}
