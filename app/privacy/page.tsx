import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "隱私權政策 — Symcio",
  description: "Symcio 蒐集哪些資料、用途、使用的第三方服務，以及你可以行使的權利。",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="隱私權政策"
      updated="2026-11-25"
      intro="本政策說明 symcio.tw（以下稱「本站」）蒐集哪些個人資料、為什麼蒐集、交給誰處理，以及你可以怎麼查詢或要求刪除。本站依中華民國《個人資料保護法》處理個人資料。"
      sections={[
        {
          heading: "一、我們蒐集的資料",
          body: [
            [
              "你主動填寫的資料：姓名、公司或品牌名稱、Email、職稱、網站、產業、公司規模，以及諮詢內容。",
              "付款資料：付款由第三方金流處理，本站不儲存信用卡號。本站只會收到付款結果、金額與你的 Email。",
              "瀏覽資料：頁面瀏覽紀錄、來源網址、UTM 參數、廣告點擊識別碼、IP 位址、瀏覽器類型，以及 Cookie。",
            ],
          ],
        },
        {
          heading: "二、蒐集目的",
          body: [
            [
              "提供你申請的服務，例如寄送診斷報告、電子書下載連結與付款確認信。",
              "回覆諮詢，並在你同意的情況下以 Email 與你聯絡。",
              "了解網站使用狀況與廣告成效，用來改善內容。",
              "履行法令義務，例如交易紀錄保存。",
            ],
          ],
        },
        {
          heading: "三、Cookie 與追蹤工具",
          body: [
            "本站使用以下工具，這些服務會在你的瀏覽器設定 Cookie 或讀取裝置資訊：",
            [
              "Google Analytics 4：流量統計。",
              "Meta Pixel 與 Meta 轉換 API：衡量 Meta 廣告成效。你送出表單時，我們可能把雜湊後（SHA-256）的 Email、IP 位址與瀏覽器資訊傳給 Meta，用於廣告歸因。",
              "PostHog：產品使用分析。",
              "HubSpot：訪客追蹤與客戶關係管理。",
            ],
            "你可以在瀏覽器設定中封鎖或刪除 Cookie，也可以使用各服務提供的停用機制。封鎖後本站主要功能仍可使用。",
          ],
        },
        {
          heading: "四、協助我們處理資料的第三方",
          body: [
            [
              "金流：Stripe、綠界科技 ECPay、PayPal。",
              "資料儲存與寄信：Supabase、Resend、Kit。",
              "網站代管：Vercel。",
              "分析與廣告：Google、Meta、PostHog、HubSpot。",
            ],
            "上述服務的伺服器可能位於台灣以外地區，因此你的資料可能被傳輸到境外。我們不會把你的個人資料出售給任何人。",
          ],
        },
        {
          heading: "五、保存期間",
          body: [
            "名單與諮詢資料保存到你要求刪除為止，或最後一次互動後 3 年。交易紀錄依稅務與會計法令規定的期間保存。",
          ],
        },
        {
          heading: "六、你的權利",
          body: [
            "依《個人資料保護法》第 3 條，你可以就自己的個人資料向我們：",
            ["查詢或請求閱覽", "請求製給複製本", "請求補充或更正", "請求停止蒐集、處理或利用", "請求刪除"],
            "請來信 info@symcio.tw 並說明你的請求。我們會在 30 天內處理。",
          ],
        },
        {
          heading: "七、政策更新",
          body: ["本政策如有重大變更，會在本頁更新日期並於網站公告。"],
        },
      ]}
    />
  );
}
