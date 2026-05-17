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
    <main className="min-h-screen bg-bg text-ink">
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
              <strong className="text-ink">Symcio · BrandOS</strong>
              是一套專注於 AI 品牌曝光量化的方法論與工具集,於 2026 年首次公開。
              我們聚焦於一個還沒有標準量測工具的新場景——
              <strong className="text-accent">AI Visibility Intelligence（AVI）</strong>
              ——讓企業能像看 Google Analytics 一樣,追蹤品牌在 ChatGPT、Claude、
              Gemini、Perplexity 答案裡的曝光、排名與引用脈絡。
            </p>

            <p>
              超過 50% 的 B2B 採購者在打開 Google 之前已先問 AI,
              但多數產業領導品牌在 AI 的答案裡曝光稀薄或描述不準確。
              這個代間轉換比 Google 取代 Yahoo 來得更快、更徹底,也更少人討論。
              Symcio 存在的原因,就是把這個盲區變成可量化、可追蹤、可優化的資產。
            </p>

            <div className="border-l-2 border-accent pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                我們在做什麼
              </h2>
              <ul className="mt-4 space-y-2 text-ink">
                <li>· 跨 ChatGPT / Claude / Gemini / Perplexity 四引擎品牌曝光量化方法論</li>
                <li>· 繁中 / 亞太 query 分佈的標準化測試集</li>
                <li>· ABVI 計算公式與評分權重 — GitHub 公開,可重現、可查核</li>
                <li>· Schema.org / Wikidata 實體建置工具,讓 AI 引擎正確認識品牌</li>
              </ul>
            </div>

            <p>
              如果你習慣用 GA、SimilarWeb 看網站流量,Symcio 提供的是
              <strong className="text-ink">AI 引擎回答裡的品牌出現頻率、排名與引用脈絡</strong>
              ——一個新時代的觀察指標。我們不取代既有分析工具,我們補上 AI 答案這層
              過去沒有可量測標準的空白。
            </p>

            <div className="border-l-2 border-accent pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                我們相對少見的幾件事
              </h2>
              <ol className="mt-4 space-y-2 text-ink">
                <li>1. 四引擎同框 benchmarking 的公開方法論</li>
                <li>2. ESG × AI 兩個資料軸放在同一儀表板</li>
                <li>3. 繁中 / 亞太 query 分佈的測試資料集</li>
                <li>4. ABVI 計算公式完整開源(MIT License)</li>
                <li>5. 退出榜單(opt-out)機制公開,品牌主可來信移除展示</li>
              </ol>
            </div>

            <div className="border-l-2 border-accent pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                BCI · Brand Capital Index
              </h2>
              <p className="mt-4 text-ink">
                Symcio 提出的綜合指標,把金融視角的品牌強度、AI 可見度、
                品牌參與度三條原本獨立的觀察軸放進同一個時序:
              </p>
              <p className="mt-3 font-mono text-sm text-accent">
                BCI = w_F · F + w_V · V + w_E · E
              </p>
              <p className="mt-3 text-ink">
                公式與權重向量於 GitHub 公開。框架精神參考 ISO 10668 國際品牌評價標準,
                並非該標準的合規認證。BCI 為觀察性指標,不構成品牌估值意見書或財務建議。
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

            <div className="border-l-2 border-gold pl-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-gold">
                服務狀態 · Beta
              </h2>
              <p className="mt-4 text-ink">
                Symcio 為 BrandOS 方法論與工具的產品名稱;法人實體(全識股份有限公司)
                與正式服務條款於 2026 年內陸續完成登記。目前以單次報告(Audit)、
                免費掃描與工具為主要交付。年訂閱與企業授權方案於法人成立後上架。
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                聯絡我們
              </h2>
              <ul className="mt-4 space-y-2 text-ink">
                <li>
                  一般洽詢:<a href="mailto:info@symcio.tw" className="text-accent">info@symcio.tw</a>
                </li>
                <li>
                  業務合作:<a href="mailto:sall@symcio.tw" className="text-accent">sall@symcio.tw</a>
                </li>
                <li>
                  資安回報:<a href="mailto:info@symcio.tw?subject=Security" className="text-accent">info@symcio.tw</a>
                </li>
                <li>
                  <a href="https://discord.gg/jGWJr2Sd" target="_blank" rel="noopener noreferrer" className="text-accent">Discord 社群</a>
                  ·
                  <a href="https://github.com/sall911/symcio" target="_blank" rel="noopener noreferrer" className="ml-2 text-accent">GitHub</a>
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
              className="inline-block rounded-card bg-accent px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
            >
              免費品牌 AI 健檢 →
            </Link>
            <Link
              href="/pricing"
              className="inline-block rounded-card border border-line px-6 py-3 text-sm font-semibold no-underline hover:border-accent hover:text-accent"
            >
              查看定價
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
