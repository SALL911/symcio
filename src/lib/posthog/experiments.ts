/**
 * PostHog A/B 實驗定義 — single source of truth。
 *
 * WHY
 *   把 flag key、變體 ID、預設值寫成 TypeScript 常數，可避免：
 *   - 字串打錯：TS autocomplete 補完
 *   - PostHog 後台 flag 改名後前端還沿用舊 key（由 pre-deploy check 擋）
 *   - 預設體驗不一致（PostHog 未載入前的 fallback 在這裡集中管）
 *
 * 要新增實驗時：
 *   1. 在 PostHog 後台建立 feature flag，開啟 multivariate
 *   2. 在本檔案增加一個 entry，key 與後台一致
 *   3. 在目標元件呼叫 `useExperiment(EXPERIMENTS.xxx)` 取得變體 ID
 */

export type ExperimentKey =
  | "hero_headline"
  | "primary_cta"
  | "web3_prominence"
  | "pricing_display"
  | "primary_narrative";

export interface ExperimentDef<V extends string = string> {
  key: ExperimentKey;
  description: string;
  variants: readonly V[];
  defaultVariant: V; // 前端在 flag 載入前的 fallback（不能與任何 variant 衝突）
  audienceHint: string; // 預期受眾描述（文件用，PostHog 後台自行設定實際 targeting）
}

function def<V extends string>(cfg: ExperimentDef<V>): ExperimentDef<V> {
  return cfg;
}

export const EXPERIMENTS = {
  hero_headline: def({
    key: "hero_headline",
    description:
      "首頁 hero 主標敘事軸：AI 可見度優先 vs ESG × AI 雙軌優先。",
    variants: ["ai_visibility", "esg_ai_dual"] as const,
    defaultVariant: "ai_visibility",
    audienceHint: "所有訪客；ESG 焦慮型客戶可能偏好 esg_ai_dual",
  }),

  primary_cta: def({
    key: "primary_cta",
    description:
      "首頁主 CTA 按鈕文案：免費掃描 vs 預約 demo。",
    variants: ["free_scan", "book_demo"] as const,
    defaultVariant: "free_scan",
    audienceHint: "上市櫃 / 金融 ICP 通常偏好 book_demo；Web3 / SaaS 偏好 free_scan",
  }),

  web3_prominence: def({
    key: "web3_prominence",
    description:
      "Schema generator 的 MetaMask 區塊曝光度：hidden（不顯示）vs visible（首屏顯示）。",
    variants: ["hidden", "visible"] as const,
    defaultVariant: "hidden",
    audienceHint: "Web3 推薦來源（referrer 含 mirror.xyz / paragraph 等）可強制 visible",
  }),

  pricing_display: def({
    key: "pricing_display",
    description:
      "定價頁呈現策略：四檔全列 vs 只露 $299，其他 hover 才出。",
    variants: ["all_tiers", "progressive"] as const,
    defaultVariant: "all_tiers",
    audienceHint: "中型 B2B（10–500 人規模）預期 progressive 轉換更好",
  }),

  primary_narrative: def({
    key: "primary_narrative",
    description:
      "關於頁主敘事：AI 可見度優先 vs ESG × AI 雙軌優先（與 hero_headline 搭配測）。",
    variants: ["ai_first", "esg_first"] as const,
    defaultVariant: "ai_first",
    audienceHint: "投資機構偏好 esg_first；SaaS 早期採用者偏好 ai_first",
  }),
} as const;

export type ExperimentVariantOf<K extends ExperimentKey> =
  (typeof EXPERIMENTS)[K]["variants"][number];
