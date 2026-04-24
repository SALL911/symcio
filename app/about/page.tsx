import type { Metadata } from "next";
import Link from "next/link";
import { TypeformEmbed } from "@/components/TypeformEmbed";

export const metadata: Metadata = {
  title: "關於全識 | Symcio BrandOS",
  description:
    "全識股份有限公司（Symcio）是台灣第一個 AI 曝光可量化系統，定義 AI Visibility Intelligence (AVI) 品類。",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-mono text-sm font-medium no-underline">
            Symcio
          </Link>
          <nav className="flex gap-5 text-sm text-muted">
            <Link href="/tools/brand-check" className="hover:text-accent no-underline">健檢</Link>
            <a href="/faq/" className="hover:text-accent no-underline">FAQ</a>
            <Link href="/pricing" className="hover:text-accent no-underline">定價</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            關於全識 · Symcio
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            量化品牌在 AI 世代的<br />曝光、排名與影響力。
          </h1>

          <div className="mt-12 space-y-10 text-base leading-relaxed text-muted">
            <p>
              <strong className="text-white">全識股份有限公司（Symcio）</strong>
              成立於 2026 年，是台灣第一個提供跨 AI 引擎品牌可見度量化的 SaaS 平台。
              我們定義了一個新的類別——
              <strong className="text-accent">AI Visibility Intelligence（AVI）</strong>
              ——並以 BrandOS 為核心產品，讓企業能像看 Google Analytics 一樣，
              追蹤品牌在 ChatGPT、Claude、Gemini、Perplexity 的真實表現。
            </p>

            <p>
              超過 50% 的 B2B 採購者在打開 Google 之前已先問 AI，但 80% 的產業領導品牌
              在 AI 的答案裡完全缺席。這個代間轉換比 Google 取代 Yahoo 來得更快、更徹底，
              也更少人討論。Symcio 存在的原因，就是把這個盲區變成可量化、可追蹤、可優化的資產。
            </p>

            <div className="border-l-2 border-accent pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                三個第一
              </h2>
              <ul className="mt-4 space-y-2 text-white">
                <li>· 台灣第一個「AI 曝光可量化系統」</li>
                <li>· 台灣唯一「跨 ChatGPT / Gemini 品牌可見度指標」</li>
                <li>· 全球第一個「AI 搜尋排名監測平台」</li>
              </ul>
            </div>

            <p>
              一句話類比：
              <strong className="text-white">
                Symcio 是 AI 時代的 SimilarWeb + SEMrush + Bloomberg 合體。
              </strong>
              SimilarWeb 量化網站流量、SEMrush 量化 Google 排名、Bloomberg 量化金融資料——
              Symcio 量化品牌在 AI 的曝光、排名、影響力。
            </p>

            <div className="border-l-2 border-accent pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                護城河
              </h2>
              <ol className="mt-4 space-y-2 text-white">
                <li>1. 市面唯一四引擎同框 benchmarking 平台</li>
                <li>2. ESG × AI 雙軌整合，切入 TNFD / LEAP 要求</li>
                <li>3. GEO（Generative Engine Optimization）術語與 AVI 品類定義權</li>
                <li>4. 繁中 / 亞太 query 分佈的獨家語料</li>
                <li>5. 完整開源方法論（ABVI methodology 於 GitHub 公開）</li>
              </ol>
            </div>

            <div className="border-l-2 border-accent pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                BCI · Brand Capital Index
              </h2>
              <p className="mt-4 text-white">
                Symcio 定義的新指標，把金融資本、AI 可見度、品牌參與度三個原本不相關的市場統一成單一時序：
              </p>
              <p className="mt-3 font-mono text-sm text-accent">
                BCI = w_F · F + w_V · V + w_E · E
              </p>
              <p className="mt-3 text-white">
                公式抽象完整公開；權重向量是 Symcio 的核心 IP。對照 InterBrand Brand Strength Score 的 Presence / Engagement / Relevance 三個因子，在 AI 時代重新定義座標系。
              </p>
              <p className="mt-4">
                <a
                  href="https://github.com/SALL911/BrandOS-Infrastructure/blob/main/docs/BCI_METHODOLOGY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  方法論白皮書（GitHub）→
                </a>
                <span className="mx-2 text-muted">·</span>
                <a
                  href="/api/bci/Symcio"
                  className="text-accent"
                >
                  公開 API 範例 →
                </a>
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                聯絡我們
              </h2>
              <ul className="mt-4 space-y-2 text-white">
                <li>
                  一般洽詢：<a href="mailto:info@symcio.tw" className="text-accent">info@symcio.tw</a>
                </li>
                <li>
                  業務合作：<a href="mailto:info@symcio.tw" className="text-accent">info@symcio.tw</a>
                </li>
                <li>
                  資安回報：<a href="mailto:info@symcio.tw" className="text-accent">info@symcio.tw</a>
                </li>
                <li>
                  <a href="https://discord.gg/jGWJr2Sd" target="_blank" rel="noopener noreferrer" className="text-accent">Discord 社群</a>
                  ·
                  <a href="https://github.com/sall911/symcio" target="_blank" rel="noopener noreferrer" className="ml-2 text-accent">GitHub</a>
                  ·
                  <a href="https://www.wikidata.org/wiki/Q138922082" target="_blank" rel="noopener noreferrer" className="ml-2 text-accent">Wikidata Q138922082</a>
                </li>
              </ul>

              <div className="mt-8 border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  或透過表單留下需求
                </p>
                <p className="mt-2 text-sm text-muted">
                  填完自動進入 Symcio 流程（Typeform → Supabase → 24 小時內回覆）。
                </p>
                <div className="mt-4">
                  <TypeformEmbed />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap gap-3">
            <Link
              href="/tools/brand-check"
              className="inline-block bg-accent px-6 py-3 text-sm font-semibold text-ink no-underline hover:opacity-90"
            >
              免費品牌 AI 健檢 →
            </Link>
            <Link
              href="/pricing"
              className="inline-block border border-line px-6 py-3 text-sm font-semibold no-underline hover:border-accent hover:text-accent"
            >
              查看定價
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
