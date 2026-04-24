/**
 * Symcio BCI Scoring Engine v2 — TypeScript port of apps/symcio-brand-audit/js/scoring-v2.js
 *
 * Client-side, deterministic (hash-seeded PRNG), ISO 10668-aligned.
 * Three layers: FBV + NCV + AIV → BCI total.
 *
 * BCI = α · FBV + β · NCV + γ · AIV   (α = 0.50, β = 0.25, γ = 0.25)
 */

export type Industry =
  | "食品飲料"
  | "科技軟體"
  | "金融服務"
  | "零售電商"
  | "製造業"
  | "醫療健康"
  | "教育培訓"
  | "餐飲服務"
  | "媒體娛樂"
  | "能源環保"
  | "其他";

export type CompanySize = "1-10人" | "11-50人" | "51-200人" | "200人以上";

export type Revenue =
  | "NTD 500萬以下"
  | "500萬-3000萬"
  | "3000萬-1億"
  | "1億-5億"
  | "5億以上"
  | "不方便透露";

export interface ScoringInput {
  brandNameZh: string;
  brandNameEn: string;
  website?: string;
  industry: Industry;
  description?: string;
  companySize: CompanySize;
  revenue: Revenue;
}

export interface Competitor {
  name: string;
  score: number;
}

export interface GeoChecks {
  schemaOrg: boolean;
  wikidata: boolean;
  knowledgePanel: boolean;
  linkedin: boolean;
  ssl: boolean;
}

export type Priority = "高" | "中" | "低";

export interface Recommendation {
  priority: Priority;
  title: string;
  desc: string;
  action: string;
}

export interface ScoringResult {
  BCI: number;
  FBV: number;
  NCV: number;
  AIV: number;
  chatgptScore: number;
  perplexityScore: number;
  googleAIScore: number;
  claudeScore: number;
  geoChecks: GeoChecks;
  geoScore: number;
  recommendations: Recommendation[];
  competitors: Competitor[];
  leapScore: number;
  brandStrength: number;
  brandName: string;
  industry: Industry;
}

export interface Tier {
  key: "excellent" | "good" | "warning" | "danger";
  label: string;
  color: string;
}

/* ---------- Seeded PRNG ---------- */

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

/* ---------- Industry tables ---------- */

const INDUSTRY_BRAND_ROLE: Record<Industry, number> = {
  食品飲料: 0.75,
  科技軟體: 0.6,
  金融服務: 0.55,
  零售電商: 0.8,
  製造業: 0.4,
  醫療健康: 0.5,
  教育培訓: 0.65,
  餐飲服務: 0.85,
  媒體娛樂: 0.9,
  能源環保: 0.35,
  其他: 0.5,
};

const INDUSTRY_LEAP: Record<Industry, number> = {
  食品飲料: 72,
  科技軟體: 25,
  金融服務: 15,
  零售電商: 35,
  製造業: 65,
  醫療健康: 40,
  教育培訓: 10,
  餐飲服務: 68,
  媒體娛樂: 8,
  能源環保: 85,
  其他: 30,
};

export const COMPETITORS: Record<Industry, Competitor[]> = {
  食品飲料: [
    { name: "統一", score: 82 },
    { name: "鮮乳坊", score: 45 },
    { name: "義美", score: 71 },
  ],
  科技軟體: [
    { name: "台積電", score: 95 },
    { name: "趨勢科技", score: 78 },
    { name: "訊連科技", score: 55 },
  ],
  金融服務: [
    { name: "國泰金", score: 88 },
    { name: "永豐金", score: 72 },
    { name: "玉山金", score: 81 },
  ],
  零售電商: [
    { name: "PChome", score: 65 },
    { name: "momo", score: 78 },
    { name: "蝦皮", score: 85 },
  ],
  製造業: [
    { name: "鴻海", score: 90 },
    { name: "巨大", score: 68 },
    { name: "上銀", score: 52 },
  ],
  醫療健康: [
    { name: "長庚", score: 75 },
    { name: "慈濟", score: 82 },
    { name: "國泰醫", score: 60 },
  ],
  教育培訓: [
    { name: "TutorABC", score: 55 },
    { name: "Hahow", score: 62 },
    { name: "均一", score: 70 },
  ],
  餐飲服務: [
    { name: "鼎泰豐", score: 92 },
    { name: "王品", score: 75 },
    { name: "八方雲集", score: 58 },
  ],
  媒體娛樂: [
    { name: "KKBOX", score: 60 },
    { name: "愛奇藝台灣", score: 45 },
    { name: "friDay", score: 50 },
  ],
  能源環保: [
    { name: "台電", score: 78 },
    { name: "中鋼", score: 65 },
    { name: "台達電", score: 85 },
  ],
  其他: [
    { name: "全聯", score: 70 },
    { name: "IKEA台灣", score: 75 },
    { name: "Costco台灣", score: 80 },
  ],
};

const REVENUE_MULT: Record<Revenue, number> = {
  "NTD 500萬以下": 0.3,
  "500萬-3000萬": 0.5,
  "3000萬-1億": 0.7,
  "1億-5億": 0.85,
  "5億以上": 1.0,
  不方便透露: 0.5,
};

const SIZE_MULT: Record<CompanySize, number> = {
  "1-10人": 0.4,
  "11-50人": 0.6,
  "51-200人": 0.8,
  "200人以上": 1.0,
};

/* ---------- Main calculation ---------- */

export function calculateBCI(data: ScoringInput): ScoringResult {
  const {
    brandNameZh,
    brandNameEn,
    website = "",
    industry,
    companySize,
    revenue,
  } = data;

  const seed = hashCode(brandNameZh + brandNameEn);

  // FBV
  const revenueMultiplier = REVENUE_MULT[revenue] ?? 0.5;
  const sizeMultiplier = SIZE_MULT[companySize] ?? 0.5;
  const brandRole = INDUSTRY_BRAND_ROLE[industry] ?? 0.5;
  const brandStrength = seededRandom(seed + 1, 30, 80);
  const FBV =
    (revenueMultiplier * 40 +
      sizeMultiplier * 30 +
      brandRole * 20 +
      brandStrength * 0.1) *
    (brandStrength / 100);

  // NCV
  const leapBase = INDUSTRY_LEAP[industry] ?? 30;
  const leapScore = seededRandom(
    seed + 2,
    Math.max(leapBase - 15, 0),
    Math.min(leapBase + 15, 100),
  );
  const biocreditEstimate = leapScore * revenueMultiplier * 10;
  const NCV = leapScore * 0.6 + biocreditEstimate * 0.02;

  // AIV
  const hasWebsite = website && /^https?:\/\//i.test(website) ? 15 : 0;
  const baseAI = seededRandom(seed + 3, 15, 55);
  const chatgptScore = Math.min(
    100,
    baseAI + hasWebsite + seededRandom(seed + 10, -5, 15),
  );
  const perplexityScore = Math.min(
    100,
    baseAI + hasWebsite + seededRandom(seed + 11, -8, 12),
  );
  const googleAIScore = Math.min(
    100,
    baseAI + hasWebsite + seededRandom(seed + 12, -3, 18),
  );
  const claudeScore = Math.min(
    100,
    baseAI + hasWebsite + seededRandom(seed + 13, -10, 10),
  );
  const AIV =
    chatgptScore * 0.35 +
    perplexityScore * 0.25 +
    googleAIScore * 0.25 +
    claudeScore * 0.15;

  // Total
  const alpha = 0.5,
    beta = 0.25,
    gamma = 0.25;
  const FBV_norm = Math.min(100, FBV * 2.5);
  const NCV_norm = Math.min(100, NCV * 1.5);
  const AIV_norm = AIV;
  const BCI = Math.round(alpha * FBV_norm + beta * NCV_norm + gamma * AIV_norm);

  // GEO checks
  const geoChecks: GeoChecks = {
    schemaOrg: seededRandom(seed + 20, 0, 10) > 7,
    wikidata: seededRandom(seed + 21, 0, 10) > 8,
    knowledgePanel: seededRandom(seed + 22, 0, 10) > 6,
    linkedin: seededRandom(seed + 23, 0, 10) > 4,
    ssl: /^https:\/\//i.test(website || ""),
  };
  const geoScore = Object.values(geoChecks).filter(Boolean).length;

  // Recommendations
  const recommendations: Recommendation[] = [];
  if (!geoChecks.wikidata)
    recommendations.push({
      priority: "高",
      title: "建立 Wikidata 品牌實體",
      desc: "在 Wikidata 建立品牌結構化實體，讓 AI 引擎的知識圖譜「認識」您的品牌。預估可提升 AI 可見度 15-25%。",
      action: "使用 Symcio Entity Builder 免費工具，5 分鐘完成",
    });
  if (!geoChecks.schemaOrg)
    recommendations.push({
      priority: "高",
      title: "嵌入 Schema.org 結構化資料",
      desc: "在官網 <head> 加入 Organization JSON-LD，讓 AI 引擎「理解」品牌做什麼。",
      action: "複製 Symcio 自動生成的代碼，貼入官網即可",
    });
  if (chatgptScore < 40)
    recommendations.push({
      priority: "中",
      title: "提升 ChatGPT 引用率",
      desc: "品牌在 ChatGPT 的提及率偏低。建議在 LinkedIn、Medium 等平台發布更多與品牌相關的公開內容。",
      action: "每週發布 2-3 篇與品牌專業領域相關的文章",
    });
  if (NCV_norm < 30)
    recommendations.push({
      priority: "中",
      title: "啟動 TNFD 自然資本評估",
      desc: "品牌的自然資本價值評分偏低。建議使用 TNFD LEAP 框架進行初步的自然依賴度評估。",
      action: "使用 TNFD LEAP 工具進行免費評估",
    });
  if (recommendations.length < 3)
    recommendations.push({
      priority: "低",
      title: "建立品牌 AI 內容策略",
      desc: "持續優化品牌在 AI 引擎中的敘事品質，確保 AI 引用的資訊正確且正面。",
      action: "聯繫 Symcio 顧問規劃 GEO 內容策略",
    });

  const competitors = COMPETITORS[industry] ?? COMPETITORS["其他"];

  return {
    BCI,
    FBV: Math.round(FBV_norm),
    NCV: Math.round(NCV_norm),
    AIV: Math.round(AIV_norm),
    chatgptScore: Math.round(chatgptScore),
    perplexityScore: Math.round(perplexityScore),
    googleAIScore: Math.round(googleAIScore),
    claudeScore: Math.round(claudeScore),
    geoChecks,
    geoScore,
    recommendations: recommendations.slice(0, 3),
    competitors,
    leapScore: Math.round(leapScore),
    brandStrength: Math.round(brandStrength),
    brandName: brandNameZh,
    industry,
  };
}

/* ---------- Tier classifier ---------- */

export function bciTier(score: number): Tier {
  if (score >= 80)
    return { key: "excellent", label: "優秀", color: "#2dd4a0" };
  if (score >= 60) return { key: "good", label: "良好", color: "#378ADD" };
  if (score >= 40)
    return { key: "warning", label: "需改善", color: "#fbbf24" };
  return { key: "danger", label: "危險", color: "#f87171" };
}

export const INDUSTRIES: Industry[] = [
  "食品飲料",
  "科技軟體",
  "金融服務",
  "零售電商",
  "製造業",
  "醫療健康",
  "教育培訓",
  "餐飲服務",
  "媒體娛樂",
  "能源環保",
  "其他",
];

export const COMPANY_SIZES: CompanySize[] = [
  "1-10人",
  "11-50人",
  "51-200人",
  "200人以上",
];

export const REVENUES: Revenue[] = [
  "不方便透露",
  "NTD 500萬以下",
  "500萬-3000萬",
  "3000萬-1億",
  "1億-5億",
  "5億以上",
];
