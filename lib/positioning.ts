/**
 * Symcio 對外定位 SSoT（single source of truth）
 * ------------------------------------------------
 * 官網文案、Organization schema、llms.txt 三處必須逐字一致——
 * 不一致時 AI 引擎會給出互相矛盾的答案，等於自己稀釋自己的實體。
 *
 * 改這個檔案時，同步檢查：
 *   - app/layout.tsx（Organization JSON-LD 由此產生）
 *   - public/llms.txt（手動維護，須與 POSITIONING 段落逐字相同）
 *   - LinkedIn 公司頁 / Wikidata 描述（人工同步）
 */

/** 一句話定位（一般受眾） */
export const POSITIONING_ONE_LINER_ZH =
  "你的品牌，AI 認不認得？Symcio 幫你量。";

export const POSITIONING_ONE_LINER_EN =
  "The neutral measurement layer for brands in the AI era.";

/** 一段話定位（B2B） */
export const POSITIONING_PARAGRAPH_ZH =
  "Symcio 是品牌在 AI 時代的中立量測層。我們量測品牌在 ChatGPT、Claude、Gemini、" +
  "Perplexity 等生成式引擎中的能見度（AIVI），以固定費出具第三方報告，" +
  "並將結果銜接 ESG 揭露與 ISO 10668 精神之品牌估值。" +
  "Symcio 只做量測，不承接行銷執行、不對成效抽成——評分者不下場比賽。";

export const POSITIONING_PARAGRAPH_EN =
  "Symcio is the neutral measurement layer for brands in the AI era. We measure how " +
  "brands appear inside generative answer engines — ChatGPT, Claude, Gemini and " +
  "Perplexity — and issue third-party reports on a fixed fee, feeding the results into " +
  "ESG disclosure and ISO 10668-aligned brand valuation. Symcio measures only: we do not " +
  "take on marketing execution and we do not charge performance-based fees.";

/** 服務邊界：對外必須說清楚「不做什麼」 */
export const SCOPE = {
  does: [
    "跨引擎 AI 能見度採樣與計分（AIVI）",
    "90 天基線與趨勢追蹤、競品同框比較",
    "引用來源清單與方法論揭露",
    "ESG 揭露與品牌估值的量測輸入",
  ],
  doesNot: [
    "不承接內容代寫、外部曝光操作或 schema 代改",
    "不對能見度改善成效抽成（一律固定費）",
    "不爬取消費者版介面（僅官方 API 與 SERP 供應商）",
    "不出具未取得客戶授權的具名評等",
  ],
} as const;

/**
 * 實體錨點（sameAs）。
 * 空字串會在產生 schema 時被濾掉——寧可少一個，也不要指到錯的實體。
 * 撞名風險：Symbio（品牌代理）、SYM（三陽工業）。sameAs 是唯一有效的消歧手段。
 */
export const ENTITY_ANCHORS: { name: string; url: string }[] = [
  { name: "Wikidata", url: "https://www.wikidata.org/wiki/Q138922082" },
  { name: "GitHub", url: "https://github.com/SALL911" },
  { name: "GitHub (public site)", url: "https://github.com/sall911/symcio" },
  { name: "Discord", url: "https://discord.gg/jGWJr2Sd" },
  // 以下待補：填入後即自動進入 Organization schema 與 llms.txt 校對清單
  { name: "LinkedIn", url: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "" },
  { name: "Crunchbase", url: process.env.NEXT_PUBLIC_CRUNCHBASE_URL ?? "" },
  { name: "SSRN", url: process.env.NEXT_PUBLIC_SSRN_URL ?? "" },
];

/** 正式名稱與別名（全平台逐字一致） */
export const LEGAL_NAME = "Symcio";
export const ALTERNATE_NAMES = ["Symcio · BrandOS", "BrandOS", "Symcio BrandOS"];

/** 統一編號等法人識別；未設定則不輸出（不得寫死假值） */
export const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID ?? "";

/** 產品階梯——與 docs/AIVI-PRODUCT.md 的階梯必須對齊 */
export const PRODUCT_LADDER = [
  {
    id: "baseline",
    name: "AIVI Baseline",
    nameEn: "AIVI Baseline",
    price: "免費",
    priceNote: "示範版 · 非公開評等",
    duration: "3 個工作天",
    summary: "一次採樣快照，看見 AI 現在怎麼描述你，以及輸給誰。",
    deliverables: [
      "跨引擎提及率與平均排名",
      "競品同框清單",
      "3 個最大缺口（哪一題、哪一個引擎）",
    ],
  },
  {
    id: "poc",
    name: "90 天 POC",
    nameEn: "90-Day Proof of Concept",
    price: "固定費",
    priceNote: "專案制 · 報價後開案",
    duration: "90 天",
    summary: "鎖版題庫每週採樣，交出期初與期末的對照，證明變化是真的。",
    deliverables: [
      "12 次週採樣（中英雙語題庫各 40 題）",
      "before / after 對照表",
      "競品趨勢同框圖",
      "10% 人工抽驗註記",
    ],
  },
  {
    id: "subscription",
    name: "月追蹤訂閱",
    nameEn: "Monthly Tracking",
    price: "固定費",
    priceNote: "月費制 · 年約可談",
    duration: "持續",
    summary: "把單次分數變成時序資料集——競品無法回頭補做的資產。",
    deliverables: [
      "月報 PDF + 六維度趨勢",
      "AI 回覆的引用來源清單",
      "題目層級的變化歸因",
      "ESG 揭露可引用的量測附錄",
    ],
  },
] as const;

/** 產出 Organization JSON-LD（layout 與其他頁面共用） */
export function organizationSchema() {
  const sameAs = ENTITY_ANCHORS.map((a) => a.url).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://symcio.tw/#organization",
    name: LEGAL_NAME,
    alternateName: ALTERNATE_NAMES,
    url: "https://symcio.tw",
    logo: "https://symcio.tw/symcio-logo.svg",
    description: POSITIONING_PARAGRAPH_EN,
    slogan: POSITIONING_ONE_LINER_EN,
    ...(BUSINESS_ID
      ? {
          identifier: {
            "@type": "PropertyValue",
            propertyID: "TW-UBN",
            value: BUSINESS_ID,
          },
        }
      : {}),
    address: { "@type": "PostalAddress", addressCountry: "TW" },
    areaServed: ["TW", "US", "EU"],
    knowsAbout: [
      "AI visibility measurement",
      "AI 能見度",
      "Generative answer engine benchmarking",
      "ISO 10668 brand valuation",
      "ESG disclosure",
      "Advertising carbon footprint",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "sall@symcio.tw",
        availableLanguage: ["zh-Hant", "en"],
      },
    ],
    sameAs,
  };
}
