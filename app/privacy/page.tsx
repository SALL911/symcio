import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "隱私權政策 | Symcio BrandOS",
  description:
    "Symcio 蒐集哪些資料、用在哪裡、交給誰處理，以及你可以如何查詢、更正、刪除或停止追蹤。",
  alternates: { canonical: "https://symcio.tw/privacy" },
};

const UPDATED = "2026-11-16";

const COLLECTED: { what: string; when: string; why: string }[] = [
  {
    what: "品牌名稱、網站、產業、公司規模、營收級距、聯絡人姓名、email",
    when: "填寫免費掃描或 Brand AI Audit 表單",
    why: "產生並寄送報告、後續聯繫",
  },
  {
    what: "email",
    when: "訂閱電子報",
    why: "寄送電子報；每封信都有取消訂閱連結",
  },
  {
    what: "手機號碼",
    when: "訂閱簡訊通知並完成驗證",
    why: "寄送你訂閱的簡訊",
  },
  {
    what: "email、訂單編號、付款狀態",
    when: "購買電子書或報告",
    why: "交付商品、開立憑證、處理退款與爭議",
  },
  {
    what: "LINE、Messenger、Instagram、Telegram 的使用者識別碼與你傳來的訊息",
    when: "你主動加入官方帳號或傳訊息給我們",
    why: "回覆你的訊息",
  },
  {
    what: "瀏覽頁面、點擊、裝置與瀏覽器類型、大略地區、來源網址與 UTM 參數",
    when: "瀏覽本網站",
    why: "了解哪些內容有用、衡量廣告成效、改善網站",
  },
];

const TOOLS: { name: string; purpose: string; optOut: string; href?: string }[] = [
  {
    name: "Google Analytics 4",
    purpose: "流量與行為統計",
    optOut: "安裝 Google Analytics 不透露資訊瀏覽器外掛",
    href: "https://tools.google.com/dlpage/gaoptout",
  },
  {
    name: "PostHog",
    purpose: "產品分析、A/B 測試、操作過程重播（用於找出介面問題）",
    optOut: "來信要求排除，或使用瀏覽器的追蹤封鎖功能",
  },
  {
    name: "HubSpot",
    purpose: "客戶關係管理、表單與電子報",
    optOut: "封鎖 Cookie，或來信要求刪除聯絡人資料",
  },
  {
    name: "Meta Pixel",
    purpose: "衡量 Facebook／Instagram 廣告成效、建立廣告受眾",
    optOut: "在 Meta 帳號的「廣告偏好設定」關閉站外動態",
    href: "https://www.facebook.com/adpreferences",
  },
  {
    name: "LINE Tag",
    purpose: "衡量 LINE 廣告成效、建立廣告受眾",
    optOut: "在 LINE「設定 → 隱私設定 → 提供使用資料」關閉相關選項",
  },
];

const PROCESSORS: { name: string; role: string }[] = [
  { name: "Vercel", role: "網站代管" },
  { name: "Supabase", role: "資料庫" },
  { name: "Resend、Kit", role: "寄送 email 與電子報" },
  { name: "三竹資訊（Mitake）", role: "寄送簡訊" },
  { name: "Typeform", role: "問卷表單" },
  { name: "Stripe、綠界科技 ECPay、PayPal", role: "金流處理" },
  { name: "LINE、Meta、Telegram", role: "官方帳號訊息收發" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-bg text-ink">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href="/" className="font-mono text-sm font-medium no-underline">
              Symcio
            </Link>
            <nav className="flex gap-5 text-sm text-muted">
              <Link href="/about" className="no-underline hover:text-accent">關於</Link>
              <Link href="/pricing" className="no-underline hover:text-accent">定價</Link>
            </nav>
          </div>
        </header>

        <article className="mx-auto max-w-3xl space-y-8 px-6 py-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Privacy Policy</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">隱私權政策</h1>
            <p className="mt-3 font-mono text-xs text-muted-dim">最後更新：{UPDATED}</p>
            <p className="mt-6 text-base leading-relaxed text-muted">
              這份文件說明 Symcio（symcio.tw）蒐集哪些資料、用在哪裡、交給誰處理，
              以及你可以怎麼查詢、更正、刪除或停止追蹤。我們只蒐集提供服務需要的資料，不販售個人資料。
            </p>
          </div>

          <Section title="一、誰在蒐集">
            <p>
              本網站由 Symcio · BrandOS 營運。公司法人實體於 2026 年內陸續完成登記，
              登記完成後會在此更新法人名稱與登記地址。在此之前，個人資料相關事項請聯絡{" "}
              <a href="mailto:info@symcio.tw?subject=Privacy" className="text-accent">info@symcio.tw</a>。
            </p>
          </Section>

          <Section title="二、蒐集的資料與用途">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted-dim">
                    <th className="py-2 pr-4 font-medium">資料</th>
                    <th className="py-2 pr-4 font-medium">何時蒐集</th>
                    <th className="py-2 font-medium">用途</th>
                  </tr>
                </thead>
                <tbody>
                  {COLLECTED.map((r) => (
                    <tr key={r.what} className="border-b border-line-soft align-top">
                      <td className="py-3 pr-4 text-ink">{r.what}</td>
                      <td className="py-3 pr-4">{r.when}</td>
                      <td className="py-3">{r.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              信用卡號等付款資料由金流業者直接處理，Symcio 不會取得也不會儲存。
              品牌 AI 可見度分析查詢的是公開 AI 引擎對「品牌名稱」的回答，不會把你的聯絡資料送進 AI 引擎。
            </p>
          </Section>

          <Section title="三、Cookie 與追蹤技術">
            <p>
              本網站使用下列工具。它們會在你的瀏覽器存放 Cookie 或類似識別碼。
              廣告追蹤工具會把你在本站的瀏覽與轉換行為回傳給該廣告平台，平台可能將其與你的平台帳號連結。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted-dim">
                    <th className="py-2 pr-4 font-medium">工具</th>
                    <th className="py-2 pr-4 font-medium">用途</th>
                    <th className="py-2 font-medium">如何停止</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((t) => (
                    <tr key={t.name} className="border-b border-line-soft align-top">
                      <td className="py-3 pr-4 text-ink">{t.name}</td>
                      <td className="py-3 pr-4">{t.purpose}</td>
                      <td className="py-3">
                        {t.href ? (
                          <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-accent">
                            {t.optOut}
                          </a>
                        ) : (
                          t.optOut
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              你也可以在瀏覽器設定中封鎖或清除 Cookie。封鎖後網站仍可瀏覽，付款與表單功能不受影響。
            </p>
          </Section>

          <Section title="四、資料交給誰處理">
            <p>我們委託下列服務商處理資料，僅限於提供服務所需的範圍：</p>
            <ul className="space-y-1">
              {PROCESSORS.map((p) => (
                <li key={p.name}>
                  · <span className="text-ink">{p.name}</span>：{p.role}
                </li>
              ))}
            </ul>
            <p>
              上述服務商與第三節的分析、廣告工具，部分主機位於台灣以外地區（主要為美國、日本），
              你的資料會因此傳輸到境外。除法律要求或你同意外，我們不會把個人資料提供給其他第三方。
            </p>
          </Section>

          <Section title="五、保存期間">
            <p>
              表單與聯絡資料保存至你要求刪除，或最後一次互動後兩年。
              交易紀錄依稅務與會計法規要求的年限保存。電子報與簡訊名單在你取消訂閱後停止寄送。
            </p>
          </Section>

          <Section title="六、你的權利">
            <p>依個人資料保護法，你可以就自己的個人資料向我們提出：</p>
            <ul className="space-y-1">
              <li>· 查詢或請求閱覽</li>
              <li>· 請求製給複製本</li>
              <li>· 請求補充或更正</li>
              <li>· 請求停止蒐集、處理或利用</li>
              <li>· 請求刪除</li>
            </ul>
            <p>
              請來信{" "}
              <a href="mailto:info@symcio.tw?subject=Privacy" className="text-accent">info@symcio.tw</a>
              ，我們會在 30 日內回覆。表單中的資料多數為選填；不提供 email 時，我們無法寄送報告或交付商品。
            </p>
          </Section>

          <Section title="七、政策更新">
            <p>
              新增追蹤工具或改變資料用途時，我們會更新本頁並修改上方的「最後更新」日期。
              重大變更會在網站上另行公告。
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </>
  );
}
