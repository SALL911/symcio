import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GEO Entity Builder | Symcio BrandOS",
  description:
    "自動產生品牌 Schema.org JSON-LD、Wikidata claims 草稿、robots.txt AI crawler 策略。讓 AI 正確認識你的品牌。",
};

const STEPS = [
  {
    code: "01",
    title: "輸入品牌基本資料",
    desc: "品牌名稱（中英文）、網域、產業類別、創辦年份、主要產品。",
  },
  {
    code: "02",
    title: "產出 Schema.org JSON-LD",
    desc: "包含 Organization、Product、FAQPage 三組結構化標記，可直接貼到 <head>。",
  },
  {
    code: "03",
    title: "Wikidata Claims 草稿",
    desc: "建議的 Wikidata Q-ID properties：instance of、industry、founded by、website。",
  },
  {
    code: "04",
    title: "robots.txt AI crawler 策略",
    desc: "依你的授權偏好，產出 GPTBot、ClaudeBot、PerplexityBot、Google-Extended 的 Allow / Disallow。",
  },
  {
    code: "05",
    title: "llms.txt 規範摘要",
    desc: "參考 llmstxt.org 產出一份「可被 AI 引用的 canonical summary」放在網站根目錄。",
  },
];

export default function EntityBuilderPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-mono text-sm font-medium no-underline">
            Symcio
          </Link>
          <nav className="flex gap-5 text-sm text-muted">
            <a href="/faq/" className="hover:text-accent no-underline">FAQ</a>
            <Link href="/pricing" className="hover:text-accent no-underline">定價</Link>
            <Link href="/about" className="hover:text-accent no-underline">關於</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            GEO Entity Builder
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            讓 AI 正確<br />認識你的品牌。
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            一鍵產生 Schema.org JSON-LD、Wikidata claims 草稿、robots.txt 與 llms.txt。
            這是讓 ChatGPT、Gemini、Perplexity 精準引用你的必要結構化資料。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/tools/brand-check"
              className="inline-block bg-accent px-6 py-3 text-sm font-semibold text-ink no-underline hover:opacity-90"
            >
              先做 Free Scan →
            </Link>
            <a
              href="https://github.com/sall911/symcio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-line px-6 py-3 text-sm font-semibold no-underline hover:border-accent hover:text-accent"
            >
              GitHub 開源範本
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            五步驟流程
          </p>
          <h2 className="mt-3 text-3xl font-semibold">從品牌名到 AI 可引用結構，約 10 分鐘。</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.code} className="border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  Step {s.code}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted">{s.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 border border-line bg-surface p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              MVP 狀態
            </p>
            <p className="mt-3 text-sm text-muted">
              互動版 Entity Builder 介面正在開發中。若你想先拿到個人客製 JSON-LD，
              歡迎寄 email 至 <a href="mailto:info@symcio.tw" className="text-accent">info@symcio.tw</a>，
              或加入 <a href="https://discord.gg/jGWJr2Sd" target="_blank" rel="noopener noreferrer" className="text-accent">Discord 社群</a>
              取得早期存取權。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
