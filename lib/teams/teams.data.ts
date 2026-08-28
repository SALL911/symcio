/**
 * ============================================================================
 *  Symcio · Teams 資料來源（Single Source of Truth）
 * ============================================================================
 *
 *  這支檔案是 /teams 頁面的「唯一資料來源」。
 *  未來要新增 / 修改 / 移除任何成員、顧問、利益關係單位，
 *  只需要編輯這支檔案，頁面與排版會自動更新，不必動到任何排版程式。
 *
 *  ── 三個區塊 ────────────────────────────────────────────────────────────
 *    1. LEADERSHIP  經營團隊（CEO / COO / CFO / CTO）— 目前為「模擬」佔位
 *    2. ADVISORS    顧問群（品牌 / ESG / AI / 國際市場）— 目前為「模擬」佔位
 *    3. STAKEHOLDERS 關鍵利益關係單位（海內外）— 公司尚未正式設立，
 *                   依規定「不使用任何官方 LOGO」，一律以『諧音 / 非正式代稱』示意。
 *
 *  ── 怎麼換成正式資料？(How to switch to real data) ───────────────────────
 *    • 改名字 / 職稱 / 介紹：直接改下方欄位字串。
 *    • 換頭像：把 avatar 改成 components/teams/Avatar.tsx 裡的任一 id
 *             （line-01 ~ line-08），或之後接真人照片時改用 photo 欄位。
 *    • 換單位 LOGO：把 public/teams/logos/<id>.svg 換成正式單色 LOGO 即可，
 *             檔名不變、頁面不用改。詳見 public/teams/logos/README 區段。
 *    • 拿掉「模擬 / 諧音」標記：把該筆的 simulated / homophone 設成 false。
 *
 *  ── 單色色票（沿用全站 tailwind 主題） ─────────────────────────────────
 *    accent(深綠) / excellent(綠) / good(藍) / warning(金) / gold(編輯金)
 *    每筆資料的 accent 欄位只接受這些 token，確保整站色調一致、好統一替換。
 * ============================================================================
 */

import type { AvatarId } from "@/components/teams/Avatar";

/** 允許的單色 token —— 對應 tailwind.config.ts 的色票，方便整站統一調色 */
export type AccentToken =
  | "accent"
  | "excellent"
  | "good"
  | "warning"
  | "gold";

export type Member = {
  /** 穩定 id（給 React key 與未來 anchor 用），請保持唯一 */
  id: string;
  /** 顯示名稱；模擬階段可用代號或「待補」 */
  name: string;
  /** 英文 / 拼音名（選填） */
  nameEn?: string;
  /** 中文職稱 */
  title: string;
  /** 英文職稱縮寫，例如 CEO / COO */
  titleEn: string;
  /** 一句話定位 / 負責範疇 */
  focus: string;
  /** 頭像 id（見 components/teams/Avatar.tsx）；接真人照片時改填 photo */
  avatar: AvatarId;
  /** 之後若有真人照片，放 public/teams/ 下並填相對路徑，會優先於 avatar */
  photo?: string;
  /** 單色主題 token */
  accent: AccentToken;
  /** 是否為「模擬 / 佔位」——會在卡片顯示金色「模擬」標記 */
  simulated?: boolean;
};

export type Advisor = {
  id: string;
  name: string;
  title: string;
  /** 領域標籤，例如「品牌策略」「ESG 法遵」 */
  domain: string;
  avatar: AvatarId;
  photo?: string;
  accent: AccentToken;
  simulated?: boolean;
};

export type Stakeholder = {
  id: string;
  /** 對外顯示的『諧音 / 非正式代稱』（公司未設立前不得使用官方名稱） */
  alias: string;
  /** 類別，例如「政府 / 法人」「加速器 / 資本」「國際標準 / 平台」 */
  category: string;
  /** 關係定位，一句話 */
  relation: string;
  /**
   * 單色 LOGO 檔案路徑（放在 public/teams/logos/）。
   * 換成正式 LOGO 時「直接覆蓋同名檔」即可，這裡不用改。
   * 留空 / 找不到檔案時，會自動以 alias 首字產生單色字標（monogram）。
   */
  logo?: string;
  accent: AccentToken;
  /** 是否為諧音代稱（顯示「諧音」標記，提醒非官方名稱） */
  homophone?: boolean;
};

/* ────────────────────────────────────────────────────────────────────────
 * 1. 經營團隊 LEADERSHIP（CEO / COO / CFO / CTO）
 *    目前全部為「模擬」，待實際人員確認後逐筆替換 name / nameEn / focus / photo。
 * ──────────────────────────────────────────────────────────────────────── */
export const LEADERSHIP: Member[] = [
  {
    id: "ceo",
    name: "SALL HUANG",
    nameEn: "SALL HUANG",
    title: "執行長",
    titleEn: "CEO",
    focus: "願景、品類定義與對外敘事；統籌 BrandOS 整體策略與募資。",
    avatar: "line-01",
    accent: "accent",
  },
  {
    id: "coo",
    name: "JIM",
    nameEn: "JIM",
    title: "營運長",
    titleEn: "COO",
    focus: "交付流程、客戶成功與跨部門營運；把方法論變成可規模化的服務。",
    avatar: "line-04",
    accent: "excellent",
  },
  {
    id: "cfo",
    name: "H",
    nameEn: "H",
    title: "財務長",
    titleEn: "CFO",
    focus: "財務模型、法人設立與合規治理；品牌資產化（BCI）的財務對接。",
    avatar: "line-06",
    accent: "good",
  },
  {
    id: "cto",
    name: "GUANHAO",
    nameEn: "GUANHAO",
    title: "技術長",
    titleEn: "CTO",
    focus: "四引擎量測架構、資料管線與 ABVI 計算引擎；開源方法論技術維運。",
    avatar: "line-03",
    accent: "warning",
  },
  {
    id: "accounting",
    name: "IREN FUNG",
    nameEn: "IREN FUNG",
    title: "會計",
    titleEn: "Accounting",
    focus: "帳務、發票與財務報表；支援法人設立後的稅務與記帳作業。",
    avatar: "line-02",
    accent: "excellent",
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * 2. 顧問群 ADVISORS（模擬）
 * ──────────────────────────────────────────────────────────────────────── */
export const ADVISORS: Advisor[] = [
  {
    id: "adv-brand",
    name: "EDDY",
    title: "品牌顧問",
    domain: "品牌敘事 · 品類定位",
    avatar: "line-02",
    accent: "accent",
  },
  {
    id: "adv-tech",
    name: "JONATHAN",
    title: "技術顧問",
    domain: "技術架構 · LLM 評測",
    avatar: "line-07",
    accent: "good",
  },
  // —— 以下席次為「英文大寫代號」預設，待人選底定後替換 ——
  {
    id: "adv-esg",
    name: "MORGAN",
    title: "ESG / 永續法遵顧問",
    domain: "永續揭露 · DPP 合規",
    avatar: "line-05",
    accent: "excellent",
    simulated: true,
  },
  {
    id: "adv-global",
    name: "ALEX",
    title: "國際市場顧問",
    domain: "跨境拓展 · 資本對接",
    avatar: "line-08",
    accent: "warning",
    simulated: true,
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * 3. 關鍵利益關係單位 STAKEHOLDERS（海內外）
 *
 *    ⚠ 公司尚未正式設立。以下名稱全部為『諧音 / 非正式代稱』，
 *      僅為示意關係定位，不代表任何實際合作、授權、代表或背書關係，
 *      也未使用任何單位的官方 LOGO。
 *
 *    要換成正式單位時：
 *      (1) 把 alias 改成正式名稱、homophone 設 false；
 *      (2) 將 public/teams/logos/<logo>.svg 覆蓋為該單位授權後的「單色 LOGO」。
 *
 *    ── 本週 0 成本外聯 5 單位對照（自用備忘，勿對外）──────────────────
 *      聯全盟約   = UN Global Compact      → 申請中（Gmail 草稿已備）
 *      自然揭露盟 = TNFD Adopter           → 申請中（Gmail 草稿已備）
 *      全球碼一號 = GS1 Taiwan             → 申請中（Gmail 草稿已備）
 *      循護護照   = CIRPASS-2 / EU DPP     → 申請中（Gmail 草稿已備）
 *      星綠藍圖   = MAS Project Greenprint → 透過 ESGpedia 對接（草稿已備）
 *    收到各單位「核准 / 接受」書面後，才把 alias 改正式名、homophone=false、
 *    並覆蓋授權後的單色 logo（避免冒用受規範的官方標誌）。
 * ──────────────────────────────────────────────────────────────────────── */
export const STAKEHOLDERS: Stakeholder[] = [
  // —— 政府 / 法人單位（示意） ——
  {
    id: "sh-gov-dev",
    alias: "國發薈",
    category: "政府 / 法人",
    relation: "新創政策與補助生態的對接窗口（示意）。",
    logo: "/teams/logos/gov-dev.svg",
    accent: "accent",
    homophone: true,
  },
  {
    id: "sh-sme",
    alias: "中小薪創署",
    category: "政府 / 法人",
    relation: "中小企業與新創輔導資源（示意）。",
    logo: "/teams/logos/sme.svg",
    accent: "accent",
    homophone: true,
  },
  {
    id: "sh-digi",
    alias: "數發步",
    category: "政府 / 法人",
    relation: "數位經濟與資料治理政策對接（示意）。",
    logo: "/teams/logos/digi.svg",
    accent: "good",
    homophone: true,
  },
  // —— 加速器 / 資本（示意） ——
  {
    id: "sh-accel",
    alias: "App窩",
    category: "加速器 / 資本",
    relation: "早期加速器與創業社群網絡（示意）。",
    logo: "/teams/logos/accel.svg",
    accent: "excellent",
    homophone: true,
  },
  {
    id: "sh-vc",
    alias: "之初資本",
    category: "加速器 / 資本",
    relation: "種子與早期投資對接（示意）。",
    logo: "/teams/logos/vc.svg",
    accent: "excellent",
    homophone: true,
  },
  // —— 國際標準 / 平台（示意） ——
  {
    id: "sh-cloud",
    alias: "雲啟方案",
    category: "國際標準 / 平台",
    relation: "雲端與 AI 基礎設施新創方案（示意）。",
    logo: "/teams/logos/cloud.svg",
    accent: "good",
    homophone: true,
  },
  {
    id: "sh-chip",
    alias: "灰達啟夢",
    category: "國際標準 / 平台",
    relation: "AI 算力與加速運算生態（示意）。",
    logo: "/teams/logos/chip.svg",
    accent: "warning",
    homophone: true,
  },
  {
    id: "sh-iso",
    alias: "標竿一零六六八",
    category: "國際標準 / 平台",
    relation: "品牌評價方法論精神參考（ISO 10668 精神，非合規認證；示意）。",
    logo: "/teams/logos/iso.svg",
    accent: "gold",
    homophone: true,
  },
  // —— 本週 0 成本外聯 5 單位（諧音示意，申請中，未掛官方 LOGO） ——
  {
    id: "sh-ungc",
    alias: "聯全盟約",
    category: "國際標準 / 平台",
    relation: "全球永續原則與 SDG 對接框架（申請中；諧音示意，非官方名稱、未授權）。",
    accent: "accent",
    homophone: true,
  },
  {
    id: "sh-tnfd",
    alias: "自然揭露盟",
    category: "國際標準 / 平台",
    relation: "自然相關財務揭露（LEAP 框架）採用者社群（申請中；諧音示意）。",
    accent: "excellent",
    homophone: true,
  },
  {
    id: "sh-gs1",
    alias: "全球碼一號",
    category: "國際標準 / 平台",
    relation: "Digital Link 與 DPP 數據載體技術標準（申請中；諧音示意）。",
    accent: "good",
    homophone: true,
  },
  {
    id: "sh-cirpass",
    alias: "循護護照",
    category: "國際標準 / 平台",
    relation: "歐盟數位產品護照（DPP）示範標準工作圈（申請中；諧音示意）。",
    accent: "warning",
    homophone: true,
  },
  {
    id: "sh-greenprint",
    alias: "星綠藍圖",
    category: "國際標準 / 平台",
    relation: "新加坡永續金融數據平台，透過既有 ESG 數據夥伴對接（申請中；諧音示意）。",
    accent: "good",
    homophone: true,
  },
];
