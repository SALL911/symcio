import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-mono text-xl font-extrabold text-white">
                S
              </span>
              <div className="leading-tight">
                <div className="font-bold tracking-[0.04em] text-ink">
                  SYMCIO · 全識
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  AI 能見度的量化標準 · 開源方法論
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Symcio · BrandOS 是專注於 AI 品牌曝光量化的方法論與工具集,
              跨 ChatGPT、Claude、Gemini、Perplexity 四引擎輸出可重現的觀察指標。
              ABVI 計算公式與評分權重於 GitHub 公開,供主管機關、學術單位與媒體查核引用。
            </p>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              產品
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/dashboard" className="no-underline hover:text-accent">AI 能見度排行榜</Link></li>
              <li><Link href="/audit" className="no-underline hover:text-accent">Brand AI Audit</Link></li>
              <li><Link href="/pricing" className="no-underline hover:text-accent">方案與定價</Link></li>
              <li><Link href="/tools" className="no-underline hover:text-accent">工具套件</Link></li>
              <li><Link href="/faq/enterprise" className="no-underline hover:text-accent">知識庫</Link></li>
              <li>
                <a
                  href="https://symcio-research.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:text-accent"
                >
                  Policy Research ↗
                </a>
              </li>
              <li><Link href="/about" className="no-underline hover:text-accent">關於 Symcio</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              社群與聯絡
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>
                <a href="https://discord.gg/jGWJr2Sd" target="_blank" rel="noopener noreferrer" className="no-underline hover:text-accent">
                  Discord 社群
                </a>
              </li>
              <li>
                <a href="https://github.com/sall911/symcio" target="_blank" rel="noopener noreferrer" className="no-underline hover:text-accent">
                  GitHub（方法論開源）
                </a>
              </li>
              <li>
                <a href="mailto:info@symcio.tw" className="no-underline hover:text-accent">
                  info@symcio.tw（一般洽詢）
                </a>
              </li>
              <li>
                <a href="mailto:sall@symcio.tw" className="no-underline hover:text-accent">
                  sall@symcio.tw（業務）
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Service status disclaimer — important during pre-incorporation phase */}
        <div className="mt-10 rounded-card border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
              服務狀態
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[1px] text-muted">
              Beta · 籌備期
            </span>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            Symcio 為 BrandOS 方法論與相關工具的產品名稱;公司法人實體與正式服務條款於
            2026 年內陸續完成登記。目前以單次報告（Audit）與免費掃描為主要交付,
            年訂閱與企業授權方案於法人成立後上架。所有 ABVI 分數、競品比較、
            排行榜為基於公開 AI 引擎查詢的觀察性指標,非投資建議、採購建議或法律意見。
            付款流程由第三方金流（Stripe）處理,如有爭議請於 7 日內來信
            <a href="mailto:info@symcio.tw" className="ml-1 text-accent">info@symcio.tw</a>。
          </p>
        </div>

        <div className="mt-6 border-t border-line pt-6 text-xs text-muted-dim">
          <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <div>
              © 2026 Symcio · BrandOS · symcio.tw · BCI 方法論參考 ISO 10668 精神。
            </div>
            <div className="flex gap-4">
              <a href="mailto:info@symcio.tw?subject=Privacy" className="hover:text-accent no-underline">隱私權</a>
              <a href="mailto:info@symcio.tw?subject=Terms" className="hover:text-accent no-underline">服務條款</a>
              <a href="mailto:info@symcio.tw?subject=Security" className="hover:text-accent no-underline">資安回報</a>
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed">
            Bloomberg / SimilarWeb / SEMrush / Interbrand / Kantar / ChatGPT / Claude / Gemini / Perplexity 等名稱僅作為類比座標或
            技術指稱（nominative fair use）,Symcio 不主張任何授權、合作、代表或背書關係。
            ABVI、BCI 指標基於公開可查詢的 AI 引擎輸出觀察,結果可能隨引擎模型更新而變動。
          </p>
        </div>
      </div>
    </footer>
  );
}
