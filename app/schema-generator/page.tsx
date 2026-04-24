import type { Metadata } from "next";
import { SchemaWikidataGenerator } from "@/components/SchemaWikidataGenerator";

export const metadata: Metadata = {
  title: "Schema + Wikidata Generator — Symcio",
  description:
    "填入品牌資料，一次產出 schema.org JSON-LD 與 Wikidata QuickStatements，讓 ChatGPT、Claude、Gemini、Perplexity 都能正確認識你的品牌。",
  alternates: { canonical: "/schema-generator" },
};

export default function SchemaGeneratorPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Free Tool · AI Visibility Intelligence
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            讓 AI 正確認識你的<br />
            <span className="bg-accent px-2">品牌實體</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-muted md:text-xl">
            填品牌資料，一次產出 <strong className="text-ink">schema.org JSON-LD</strong>（餵 ChatGPT / Claude / Gemini / Perplexity）與{" "}
            <strong className="text-ink">Wikidata QuickStatements</strong>（餵 Google KG、Siri、AI 訓練語料）。
            送出後我們會把檔案寄到你信箱，並自動把你的品牌加進 Free Scan 掃描佇列，24 小時內回傳四引擎曝光快照。
          </p>
          <ol className="mt-8 grid max-w-4xl gap-3 text-sm text-muted md:grid-cols-3">
            <li className="border border-line bg-white p-4">
              <p className="font-mono text-xs text-ink">01</p>
              <p className="mt-2">填入品牌基礎資料（名稱、網站、描述、社群）</p>
            </li>
            <li className="border border-line bg-white p-4">
              <p className="font-mono text-xs text-ink">02</p>
              <p className="mt-2">即時預覽 JSON-LD 與 QuickStatements，Copy 即用</p>
            </li>
            <li className="border border-line bg-white p-4">
              <p className="font-mono text-xs text-ink">03</p>
              <p className="mt-2">送出後自動排進 Free Scan，寄四引擎曝光報告到信箱</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SchemaWikidataGenerator />
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            為什麼要做這件事
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold md:text-4xl">
            沒有結構化資料，AI 引擎只會亂猜你是誰。
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="border border-line p-6">
              <h3 className="text-lg font-semibold">schema.org JSON-LD</h3>
              <p className="mt-3 text-sm text-muted">
                現代 AI 引擎與搜尋爬蟲（包括 Googlebot、GPTBot、ClaudeBot、PerplexityBot）首選的品牌實體資料格式。
                嵌進 &lt;head&gt; 後，回答你的品牌問題時會直接引用。
              </p>
            </article>
            <article className="border border-line p-6">
              <h3 className="text-lg font-semibold">Wikidata</h3>
              <p className="mt-3 text-sm text-muted">
                Google Knowledge Graph、Apple Siri、以及大多數 LLM 的公共訓練語料。
                有 Wikidata 條目等於被寫進 AI 的背景知識——而且免費。
              </p>
            </article>
            <article className="border border-line p-6">
              <h3 className="text-lg font-semibold">Symcio Free Scan</h3>
              <p className="mt-3 text-sm text-muted">
                我們把送出的品牌自動排進四引擎曝光掃描佇列，24 小時內回傳
                ChatGPT / Claude / Gemini / Perplexity 的實際曝光、排名、競品同框結果。
              </p>
            </article>
          </div>
          <p className="mt-8 max-w-3xl text-sm text-muted">
            完成 JSON-LD + Wikidata 只是第一步。要知道實際效果，往下拉或回首頁跑{" "}
            <a href="/#scan" className="text-ink underline">Free Scan</a>——
            或升級 <a href="/#pricing" className="text-ink underline">$299 AI Visibility Audit</a>{" "}
            解鎖 20 個產業 prompt + 改善建議 PDF。
          </p>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-muted">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p>© {new Date().getFullYear()} Symcio · AI Visibility Intelligence</p>
            <p className="font-mono text-xs">AI Visibility Intelligence · 品類定義者</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
