import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import AuditForm from "@/components/AuditForm";

export const metadata: Metadata = {
  title: "Brand AI Audit — 3 分鐘免費品牌 AI 可見度診斷 | Symcio",
  description:
    "跨 ChatGPT / Perplexity / Google AI / Claude 的 BCI 品牌資本指數診斷。依循 ISO 10668，含 FBV + NCV + AIV 三維分析、GEO 檢查、競品比較、PDF 報告。",
  openGraph: {
    title: "Symcio Brand AI Audit",
    description:
      "3 分鐘免費診斷品牌在 4 大 AI 引擎的可見度。BCI 方法論依循 ISO 10668。",
    type: "website",
  },
};

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Brand AI Audit v2
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            你的品牌在 AI 世界裡
            <br />
            看得見嗎？
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
            3 分鐘免費診斷 — 了解品牌在 ChatGPT、Perplexity、Google AI、Claude
            的表現。輸出 BCI 分數 + 改善建議 + PDF 報告。
          </p>
        </div>
      </section>

      <section className="px-6 py-10 md:py-16">
        <AuditForm />
      </section>

      <Footer />
    </main>
  );
}
