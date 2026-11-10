import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "訂閱品牌治理雙週刊 | Symcio BrandOS",
  description:
    "每兩週 3 分鐘，看懂 AI 怎麼介紹你的品牌。整理 AI 搜尋、外銷合規與 ESG 的變化，每期附一個當天就能做的動作。",
  alternates: { canonical: "/subscribe" },
};

const ITEMS = [
  {
    title: "產業重點",
    body: "AI 搜尋、社群平台與品牌曝光的變化，只挑跟台灣企業有關的。",
  },
  {
    title: "外銷與 ESG 提醒",
    body: "歐盟數位產品護照（DPP）等供應鏈要求，提早知道該準備什麼。",
  },
  {
    title: "3 分鐘自我檢查",
    body: "每期一個簡單動作，自己就能確認品牌在 AI 和搜尋裡的狀況。",
  },
];

export default function SubscribePage() {
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

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[1.05fr_1fr] md:py-20">
        <section className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Symcio 全識 · 品牌治理雙週刊
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            每兩週 3 分鐘，<br />看懂 AI 怎麼介紹你的品牌。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            客戶找供應商之前，越來越常先問 AI。這份雙週刊整理品牌、AI 搜尋與外銷合規的變化，每期附一個當天就能做的動作。
          </p>

          <ul className="mt-10 space-y-5">
            {ITEMS.map((item) => (
              <li key={item.title} className="border-l-2 border-accent pl-5">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 border-t border-line pt-4 text-sm text-muted">
            雙週寄送 · 免費 · 隨時可以取消訂閱
          </p>
        </section>

        <section
          aria-label="訂閱表單"
          className="min-w-0 rounded-card border border-line bg-surface p-6 md:p-8"
        >
          <h2 className="text-2xl font-semibold">免費訂閱</h2>
          <p className="mt-1 text-sm text-muted">填寫後，下一期會直接寄到你的信箱。</p>

          <div className="mt-6">
            <div
              className="hs-form-frame"
              data-region="na2"
              data-form-id="dedb5e0d-6df9-4f57-a2e9-b237c50db615"
              data-portal-id="244117180"
            />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            你提供的資料只用於寄送本雙週刊與相關服務通知，不會提供給第三方。每封信下方都有取消訂閱連結。
          </p>
        </section>
      </div>

      <Script
        src="https://js-na2.hsforms.net/forms/embed/244117180.js"
        strategy="afterInteractive"
      />
    </main>
  );
}
