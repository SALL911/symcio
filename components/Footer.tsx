import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-mono text-xl font-extrabold text-ink">
                S
              </span>
              <span className="font-bold text-white">Symcio · BrandOS</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              全識股份有限公司 — 台灣第一個 AI 曝光可量化系統，定義 AI Visibility Intelligence（AVI）品類。
            </p>
            <p className="mt-4 font-mono text-xs text-muted-dim">
              Wikidata: Q138922082
            </p>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              產品
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/audit" className="no-underline hover:text-accent">Brand AI Audit</Link></li>
              <li><Link href="/pricing" className="no-underline hover:text-accent">方案與定價</Link></li>
              <li><Link href="/tools" className="no-underline hover:text-accent">工具套件</Link></li>
              <li><Link href="/faq/enterprise" className="no-underline hover:text-accent">知識庫</Link></li>
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
                <a href="mailto:sall@symcio.tw" className="no-underline hover:text-accent">
                  sall@symcio.tw
                </a>
              </li>
              <li>
                <a href="mailto:info@symcio.tw" className="no-underline hover:text-accent">
                  info@symcio.tw
                </a>
              </li>
              <li className="font-mono text-xs text-muted-dim">0980-326-901</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs text-muted-dim">
          <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <div>
              © 2026 全識股份有限公司 · Symcio / BrandOS. All rights reserved. · BCI 依循 ISO 10668。
            </div>
            <div className="flex gap-4">
              <a href="mailto:info@symcio.tw" className="hover:text-accent no-underline">隱私權</a>
              <a href="mailto:info@symcio.tw" className="hover:text-accent no-underline">服務條款</a>
              <a href="mailto:info@symcio.tw" className="hover:text-accent no-underline">資安回報</a>
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed">
            Bloomberg / SimilarWeb / SEMrush / InterBrand / Kantar 僅作為類比座標（nominative fair use），Symcio 不主張任何授權、合作或代表關係。
          </p>
        </div>
      </div>
    </footer>
  );
}
