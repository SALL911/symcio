/**
 * FAQ knowledge base — 5 audience categories × 10 Q&A each.
 *
 * Drives app/faq/[category]/page.tsx and its FAQPage JSON-LD.
 * All content in 繁體中文 per CLAUDE.md § three.
 */

export type FaqCategoryKey =
  | "enterprise"
  | "esg"
  | "investor"
  | "security"
  | "creator";

export interface FaqEntry {
  q: string;
  a: string;
}

export interface FaqCategory {
  key: FaqCategoryKey;
  label: string;
  tagline: string;
  audience: string;
  entries: FaqEntry[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "enterprise",
    label: "企業決策者",
    tagline: "CMO / CTO / 品牌長的常見問題",
    audience: "Enterprise · CMO / CTO",
    entries: [
      {
        q: "Symcio BrandOS 跟 InterBrand、Kantar BrandZ 有什麼差別？",
        a: "InterBrand 與 Kantar 以年度、調研與媒體 sentiment 為主，測的是消費者對品牌的記憶。Symcio BCI 是每日時序、跨 ChatGPT / Claude / Gemini / Perplexity 四引擎的客觀可見度測量，補上 AI 時代缺失的維度。兩者互補而非取代。",
      },
      {
        q: "為什麼要關心「AI 可見度」？我們的品牌 SEO 排第一就夠了。",
        a: "超過 50% 的 B2B 採購者在打開 Google 前已先問 AI。AI 引擎不做 SERP 排名，而是「選擇提及哪些品牌」。若你的品牌不在 ChatGPT 的答案裡，即使 Google 第一也無效。",
      },
      {
        q: "導入 Symcio 的時程大約多久？",
        a: "免費健檢 3 分鐘即可完成。專業版啟動約需 2 週（Wikidata + Schema.org 基礎建設上線後，AI 引擎重新爬取）。完整的 GEO 策略效果通常 3–6 個月內見效。",
      },
      {
        q: "運動產業 175% 抵稅適用條件是什麼？",
        a: "依《運動產業發展條例》第 26-2 條，企業投資合作運動產業（含運動行銷、賽事贊助、運動科技）可抵減當年度應納營利事業所得稅至 175%。Symcio 企業版可協助完成投資量化佐證與成效追蹤，符合抵稅申請要求。",
      },
      {
        q: "企業版的 Brand Capital API 可以做什麼？",
        a: "Brand Capital API 提供程式化存取 BCI 子分數、競品時序、AI 語料 snippets、產業 benchmark。適用於嵌入既有 BI（Tableau / Power BI）、投資者關係頁面、CRM 品牌健康 dashboard。",
      },
      {
        q: "我們有全球市場，BCI 支援多少語言？",
        a: "核心方法論支援繁中、簡中、英文、日文、韓文、越南文。其他語言客戶自備語料可擴展。AI 引擎本身為多語言原生，不限語言。",
      },
      {
        q: "Symcio 如何處理敏感或機密的品牌資料？",
        a: "客戶資料加密儲存於 Supabase（AWS Tokyo），遵守 ISO 27001 精神。BCI 子分數、raw metrics、權重向量屬客戶 IP；公開 API 僅暴露 total_bci。員工存取採最小權限與 audit log。",
      },
      {
        q: "競品追蹤可以追幾個品牌？",
        a: "免費版 1 個競品、專業版 5 個、企業版不限。競品同框出現比例會自動寫入 visibility_results。",
      },
      {
        q: "如果我想自己跑演算法，程式碼可以拿到嗎？",
        a: "是。方法論與 engine 程式碼完全開源於 github.com/SALL911/BrandOS-Infrastructure。產業權重向量屬 Symcio 核心 IP 不公開，但公式結構與參數名稱全公開。",
      },
      {
        q: "採購流程？",
        a: "寫信到 info@symcio.tw，我們 24 小時內回覆。專業版簽 1 年合約、企業版可客製化條款。支援美金電匯、新台幣月付、credit card recurring（經 Stripe）。",
      },
    ],
  },
  {
    key: "esg",
    label: "ESG / 永續",
    tagline: "TNFD / IFRS S1-S2 / LEAP 框架",
    audience: "ESG · 永續長",
    entries: [
      {
        q: "TNFD 要求的聲譽風險揭露，Symcio 可以怎麼協助？",
        a: "TNFD Reputational Risk 揭露需要客觀、量化、前瞻性訊號。Symcio 的四引擎 AI 可見度資料直接對應此要求，比傳統媒體 sentiment 早 6–12 個月反映聲譽變化，可作為 TNFD 報告的 supporting evidence。",
      },
      {
        q: "BCI 的 NCV（自然資本價值）是什麼？",
        a: "NCV = Nature Capital Value，基於 TNFD LEAP 框架設計，整合產業自然依賴度基準（INDUSTRY_LEAP）與生物信用（Biocredit）估算。反映品牌對自然資本的依賴與影響。",
      },
      {
        q: "IFRS S1 / S2 的揭露，Symcio 可以產出哪些資料？",
        a: "S1 要求「材料性風險」揭露 — Symcio 提供品牌聲譽風險時序；S2 要求氣候相關風險 — Symcio 的 NCV 軸整合 TNFD LEAP 可作為氣候 × 品牌的交集層資料。",
      },
      {
        q: "報告輸出格式支援哪些？",
        a: "PDF（符合 GRI / SASB / IFRS S 架構）、CSV、JSON（給 Bloomberg ESG / S&P Global / MSCI 第三方資料串接）。企業版可自訂模板。",
      },
      {
        q: "有跟會計事務所合作嗎？",
        a: "我們是 ESG 審計公司的資料供應層（Big 4 / SGS / DNV / BV / TÜV Rheinland），不搶他們的 advisory 生意。可配合你們的現有簽證流程。",
      },
      {
        q: "Biocredit 怎麼計算？",
        a: "基於 LEAP 評估分數 × 產業營收倍數 × 自然依賴度權重。詳細公式見 docs/BCI_METHODOLOGY.md NCV 小節；程式碼見 lib/scoring.ts。",
      },
      {
        q: "小型品牌也需要做 TNFD 嗎？",
        a: "大型上市公司 2025 年起強制；中型企業 2026–2027 逐步；供應鏈連帶受影響。Symcio 免費版即可做基礎 LEAP 評估，不必一開始就企業版。",
      },
      {
        q: "碳排（CO2）有在 BCI 裡嗎？",
        a: "BCI 本體不直接算碳排，但 NCV 的產業 LEAP 基準隱含碳密度因子（能源 85、製造 65、科技 25）。完整碳排請串接客戶既有的 LCA 工具，Symcio 提供接口。",
      },
      {
        q: "TNFD LEAP 四階段，Symcio 在哪幾階段支援？",
        a: "L（Locate）— 產業基準對應；E（Evaluate）— 品牌 NCV 評分；A（Assess）— 自動化報告產出；P（Prepare）— AI 可見度訊號作為風險指標。四個階段都有覆蓋。",
      },
      {
        q: "與其他 ESG 平台（如 Watershed、Persefoni）的差異？",
        a: "Watershed / Persefoni 專注在碳核算。Symcio 補上「品牌聲譽 × 自然資本」交集層，兩者不衝突，可並行使用。",
      },
    ],
  },
  {
    key: "investor",
    label: "投資人",
    tagline: "VC / PE / 策略投資",
    audience: "Investor · VC / PE",
    entries: [
      {
        q: "Symcio 的品類定位？",
        a: "AI Visibility Intelligence (AVI) — 由 Symcio 定義的新品類。定位類比為 AI 時代的 SimilarWeb + SEMrush + Bloomberg 合體（類比座標，非合作關係）。",
      },
      {
        q: "市場規模？",
        a: "全球品牌估值市場年產值約 $10B（InterBrand / Kantar / Brand Finance 為主）。生成式 AI 取代 >50% 的 B2B top-of-funnel 搜尋。兩市場交集（AI 時代品牌資產量化）目前無領導者，Symcio 定義此品類。",
      },
      {
        q: "技術護城河？",
        a: "1. 四引擎同框 benchmarking 資料集（台灣唯一、全球少數）；2. BCI 公式（公開抽象、權重閉源，PageRank 式揭露）；3. 繁中 / 亞太語料獨家；4. 開源方法論建立品類定義權。",
      },
      {
        q: "Traction 狀態？",
        a: "MVP 已上線於 symcio.tw；免費 Typeform 健檢 + $299 paid audit 已串 Stripe；已跑過多家台灣上市公司 pilot audit。詳細 metrics 簽 NDA 後分享。",
      },
      {
        q: "募資輪次 / 估值？",
        a: "目前規劃 seed round。策略投資人 / 消費品/品牌資產背景 PE / 亞太 B2B SaaS VC 優先。估值與 term sheet 面談再討論（信裡不談 term）。",
      },
      {
        q: "收入模式？",
        a: "Free（漏斗入口）→ $299 paid audit（流量變現）→ NTD 10萬/年 專業版訂閱 → NTD 25–50萬/年 企業版（含 API 授權、ESG 自動化）→ Data licensing（agency / 金融機構）。五層階梯。",
      },
      {
        q: "競爭對手？",
        a: "直接競爭：Profound (US)、Athena AI、Peec AI、Otterly.ai。Symcio 差異 = 繁中 / 亞太深度 + ESG 雙軌 + BCI 單一指標護城河。",
      },
      {
        q: "Exit 策略？",
        a: "策略併購最可能買家：HubSpot / Salesforce / Adobe（Marketing Cloud 缺 AI Channel tab）、Bloomberg / S&P Global（ESG × 品牌資料層）、Brandwatch / Meltwater / Cision（社群 + AI）。IPO 是長期選項。",
      },
      {
        q: "團隊？",
        a: "創辦人 / CEO：`[Name, 資歷]`。技術顧問 / 學術顧問 / ESG 諮詢委員會成員詳見 /about 頁。",
      },
      {
        q: "投資人怎麼聯絡？",
        a: "sall@symcio.tw，標題「Investment Inquiry」。24 小時內回覆。我們不收 pitch deck 當附件；信裡講完市場、差異、traction 即可。",
      },
    ],
  },
  {
    key: "security",
    label: "資安與合規",
    tagline: "SOC2 / ISO 27001 / 個資法",
    audience: "Security · CISO / DPO",
    entries: [
      {
        q: "資料儲存位置？",
        a: "主要資料庫 Supabase（AWS Tokyo ap-northeast-1）。客戶可選擇 EU 或 US 區域（企業版）。皆為 SOC2 Type II 認證環境。",
      },
      {
        q: "加密？",
        a: "傳輸層 TLS 1.3；靜態資料 AES-256（Supabase 內建）；客戶 API key 以 envelope encryption 儲存；BCI 子項分數在 API 邊界 server-side filter 後才回傳。",
      },
      {
        q: "存取控制？",
        a: "Supabase RLS（Row Level Security）—客戶資料預設僅 service_role 可讀。成員模式啟用後採 member_id ↔ tracked_brands 雙重 join 驗證。員工存取 audit log 永久保留。",
      },
      {
        q: "GDPR / 個資法合規？",
        a: "最小蒐集原則、顯性同意、可刪除權、資料可攜權皆支援。隱私政策與資料處理協議（DPA）可於 info@symcio.tw 索取。",
      },
      {
        q: "Penetration testing？",
        a: "企業版客戶簽約後每半年外部滲透測試，報告可索取。發現的 critical/high 修復 SLA 為 7/30 天。",
      },
      {
        q: "Symcio 會把我的資料給其他 AI 拿去訓練嗎？",
        a: "絕對不會。我們呼叫 OpenAI / Anthropic / Google / Perplexity 的 API 時，均使用 opt-out of training 的企業模式。客戶資料不進入第三方訓練語料。",
      },
      {
        q: "如果 Symcio 公司倒了，我的資料如何？",
        a: "企業版合約含 data escrow clause — 若營運中止，所有客戶資料於 30 天內原格式交還客戶，並配合遷移至客戶指定的替代平台。",
      },
      {
        q: "API rate limit？",
        a: "免費版 100 req/hour；專業版 10,000 req/hour；企業版可客製化（含專屬 IP allowlist + private endpoint）。",
      },
      {
        q: "漏洞通報（Responsible disclosure）？",
        a: "info@symcio.tw，主旨「[Security] ...」。我們承諾 72 小時內初步回應；合格 P0-P1 漏洞提供 bounty（依嚴重度 NT$5k–50k）。",
      },
      {
        q: "Security audit 報告可以拿到嗎？",
        a: "企業版客戶簽 NDA 後可索取 SOC2 Type II 報告、滲透測試摘要、ISO 27001 對應 control matrix。",
      },
    ],
  },
  {
    key: "creator",
    label: "創作者",
    tagline: "個人品牌 / 自營商",
    audience: "Creator · Solopreneur",
    entries: [
      {
        q: "個人創作者也能用 Symcio 嗎？",
        a: "可以。免費版就夠個人品牌 / KOL / 自營商做初步 AI 可見度檢查。付費版本更針對企業需求，個人用戶選 Free 即可。",
      },
      {
        q: "我只有 IG / YouTube 沒有官網，還能測嗎？",
        a: "可以，但資料會少一軸（無法驗 Schema.org / SSL）。建議至少架一個 Notion / Linktree 頁面作為品牌中繼站；IG / YouTube URL 直接填進「官方網站」欄位也行。",
      },
      {
        q: "AI 引擎怎麼看個人品牌？",
        a: "與企業品牌相同，AI 引擎會根據訓練語料 + 即時檢索決定是否提及。個人品牌可透過 LinkedIn 貼文、Medium、維基百科條目建立 AI 可辨識的「實體」。",
      },
      {
        q: "我的維基百科條目被刪了怎麼辦？",
        a: "Wikidata（結構化資料）比 Wikipedia（敘事百科）更容易通過。建議先建 Wikidata entity（Symcio Entity Builder 工具可用），再嘗試 Wikipedia。",
      },
      {
        q: "做 AI SEO 要寫多少內容？",
        a: "不是量，是品質 + 分佈。建議每月 2–4 篇原創文章（LinkedIn 或 Medium），主題緊扣你的專業 category。3–6 個月會看到 AI 開始主動提及。",
      },
      {
        q: "Symcio 有聯盟行銷 / 推薦獎金嗎？",
        a: "規劃中。Discord 社群會先開放 early testers。追 Discord 最新。",
      },
      {
        q: "我可以把 Symcio 工具整合到自己的客戶提案裡嗎？",
        a: "可以。Agency-style 合作見 /pricing 企業版或參考 content/cold-outreach/03-agency-partner.md 的模式。",
      },
      {
        q: "中小企業主沒技術背景，能用嗎？",
        a: "可以。免費健檢全部視覺化（BCI 分數 + 四引擎進度條 + 改善建議），不需技術知識。企業版會派專人導入。",
      },
      {
        q: "學生 / 研究者可以用嗎？",
        a: "可以。方法論全部開源於 GitHub，可做學術研究。請在論文引用中標示 Symcio / BrandOS-Infrastructure repo。",
      },
      {
        q: "我沒錢，但想學 GEO / AI SEO 怎麼做？",
        a: "加入 Discord（discord.gg/jGWJr2Sd）；GitHub docs 全開源；Medium 上搜尋 Symcio 有教學文章；每週有免費 office hour。",
      },
    ],
  },
];

export function findCategory(key: string): FaqCategory | undefined {
  return FAQ_CATEGORIES.find((c) => c.key === key);
}
