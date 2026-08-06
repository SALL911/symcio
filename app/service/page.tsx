import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI 自動獲客成交系統 — Symcio 服務方案",
  description:
    "Symcio 為你打造一套 AI 自動獲客行銷成交系統：BCI 電子書變現、Stripe / 綠界雙金流、LINE / Meta / Telegram 自動回覆導購，從陌生流量到即時現金流的完整管線。",
};

const MODULES = [
  {
    tag: "01 · 變現載體",
    title: "BCI 方法論電子書直售",
    desc: "把你的 BCI 方法論做成可即時下載的電子書，付款後自動交付 PDF，0 人工出貨。",
    href: "/ebook",
  },
  {
    tag: "02 · 金流",
    title: "Stripe + 綠界 ECPay 雙軌結帳",
    desc: "海外客刷卡走 Stripe、台灣客用台幣（信用卡 / ATM / 超商）走綠界。結帳頁反應 < 0.2 秒。",
    href: "/pricing",
  },
  {
    tag: "03 · 自動獲客",
    title: "LINE / Meta / Telegram 自動回覆",
    desc: "新訪客私訊即自動回覆，引導到免費 BCI 診斷與電子書，把社群流量變成名單與訂單。",
    href: "/audit",
  },
  {
    tag: "04 · 診斷誘餌",
    title: "免費 BCI 快速診斷",
    desc: "用四引擎可見度免費掃描當誘餌，收集名單、建立信任，再導入電子書與顧問方案。",
    href: "/audit",
  },
];

const FLOW = [
  "社群廣告 / 貼文 / 私訊",
  "自動回覆導流（LINE / Meta / Telegram）",
  "免費 BCI 診斷收名單",
  "電子書 NT$390 即時成交",
  "顧問方案 / 月費治理向上銷售",
];

export default function ServicePage() {
  const ebookHref = "/ebook" as Route;
  const contactHref =
    "mailto:sall@symcio.tw?subject=我想導入%20AI%20自動獲客成交系統" as Route;

  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Service · 服務方案
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            AI 自動獲客
            <br />
            行銷成交系統
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            從陌生流量到即時現金流的完整管線：自動回覆獲客 → 免費診斷收名單 →
            電子書即時成交 → 顧問方案向上銷售。Symcio 幫你一次搭好、上線即收款。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ebookHref}
              className="inline-block rounded-card bg-accent px-6 py-3 text-base font-semibold text-white no-underline hover:bg-accent-dim"
            >
              先看成交範例：BCI 電子書 →
            </Link>
            <Link
              href={contactHref}
              className="inline-block rounded-card border border-accent px-6 py-3 text-base font-semibold text-accent no-underline hover:bg-accent hover:text-white"
            >
              預約導入諮詢 →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold">系統四大模組</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {MODULES.map((m) => (
              <Link
                key={m.title}
                href={m.href as Route}
                className="block rounded-card border border-line bg-surface-2 p-6 no-underline hover:border-accent"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{m.tag}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{m.title}</h3>
                <p className="mt-2 text-sm text-muted">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold">成交管線</h2>
          <ol className="mt-8 grid gap-3 md:grid-cols-5">
            {FLOW.map((step, i) => (
              <li key={step} className="rounded-card border border-line p-4">
                <span className="font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 text-sm text-ink">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link
              href={contactHref}
              className="inline-block rounded-card bg-accent px-6 py-3 text-base font-semibold text-white no-underline hover:bg-accent-dim"
            >
              預約導入諮詢 →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
