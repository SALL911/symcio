import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ComplianceAuditForm } from "@/components/ComplianceAuditForm";

export const metadata: Metadata = {
  title: "Compliance Pre-Audit · 1 頁合規曝險評估 — Symcio",
  description:
    "輸入公司+品類+目標市場,2 分鐘拿到 EU ESPR/DPP/CSRD、IFRS S1S2、TNFD 等永續合規曝險評估。免費,寄報告到信箱。",
};

export default function ComplianceAuditPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Free Tool · Compliance Pre-Audit
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            2 分鐘拿到你的
            <br />
            <span className="text-accent">永續合規曝險評估</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
            輸入公司、品類、銷售市場,AI 自動產出 1 頁曝險評估:EU ESPR / DPP / CSRD、
            US SEC Climate、IFRS S1/S2、TNFD 等主要法規對你的關聯程度,
            加上 3 個優先行動建議。免費,即時顯示 + 寄到你的信箱。
          </p>
          <p className="mt-4 font-mono text-xs text-muted">
            觀察性指標,非法律意見;實際適用請洽會計師 / 律師。
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <aside className="space-y-5">
              <div className="rounded-card border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  你會拿到
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-ink">
                  <li>· 150 字曝險摘要(你的品類在指定市場面對什麼)</li>
                  <li>· 6 大主要框架對照(EU / US / APAC)+ 相關度等級</li>
                  <li>· 3 個優先行動建議(可實作)</li>
                  <li>· 完整 PDF / HTML 報告寄到 email</li>
                </ul>
              </div>

              <div className="rounded-card border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  如何使用結果
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-muted">
                  <li>· 內部 ESG 委員會的會前 briefing</li>
                  <li>· 與會計師 / 永續顧問對齊優先順序</li>
                  <li>· 給董事會看「我們知道有什麼挑戰」</li>
                  <li>· 內部部門協作的 baseline</li>
                </ul>
              </div>

              <div className="rounded-card border-l-4 border-gold bg-surface p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
                  Beta · 免費
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  目前為 Beta 階段免費開放。正式版上線後,深度版本(含
                  industry benchmarking + 客製化框架對應)會於企業合作方案提供。
                </p>
              </div>
            </aside>

            <div>
              <ComplianceAuditForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
