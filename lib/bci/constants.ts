/**
 * BCI (Brand Capital Index) v1.0 canonical constants.
 *
 * Single source of truth for formula weights, dimension codes, and platform
 * weights. Aligned with Symcio Research SSRN whitepaper v1.0
 * (Huang, Chih-Chuan, 2026, ORCID 0009-0004-6472-4566).
 *
 * ============================================================================
 * Files that IMPORT from this module (auto-propagating):
 *   - lib/scoring.ts           (audit MVP scoring engine, weights)
 *
 * Files that DO NOT import (manual sync required if values change):
 *   - app/page.tsx             (homepage three-dim cards prose)
 *   - app/about/page.tsx       (about page three-dim description)
 *   - app/pricing/page.tsx     (pricing FAQ methodology answer)
 *   - app/audit/page.tsx       (audit page meta description)
 *   - components/AuditReport.tsx (radar labels, methodology details, PDF table)
 *   - lib/faq-data.ts          (ESG FAQ entries)
 *
 * When BCI weights are rebalanced (e.g. 2030 baseline goes live), update the
 * numeric values below, then grep for the OLD numerals across the unmigrated
 * surfaces above and update prose to match.
 * ============================================================================
 */

/** Three BCI dimensions per v1.0 paper. Codes are stable identifiers. */
export const BCI_DIMENSIONS = {
  FBV: {
    code: "FBV",
    nameEn: "Financial Brand Value",
    nameZh: "財務品牌價值",
    methodology: "ISO 10668 income method: Brand Revenue × Role-of-Brand × Brand Strength Score ÷ Discount Rate",
  },
  SCV: {
    code: "SCV",
    nameEn: "Sustainability Compliance Value",
    nameZh: "永續合規價值",
    methodology: "Regulation-neutral: 0.40·RCS + 0.40·EDS + 0.20·NCS",
  },
  AIV: {
    code: "AIV",
    nameEn: "AI Visibility Value",
    nameZh: "AI 可見度價值",
    methodology: "Σp (CitationRate_p × PlatformWeight_p) × GEO_Coverage × NarrativeQuality",
  },
} as const;

/** BCI top-level weights — α + β + γ = 1.00, BCI ∈ [0, 100]. */
export const BCI_WEIGHTS = {
  2026: { alpha: 0.5, beta: 0.25, gamma: 0.25 },
  2030: { alpha: 0.35, beta: 0.35, gamma: 0.3 },
} as const;

/** Currently active weight vector (2026 baseline per v1.0 paper). */
export const BCI_CURRENT_WEIGHTS = BCI_WEIGHTS[2026];

/** SCV sub-indicator weights — sum = 1.00, per v1.0 §3.2. */
export const SCV_SUB_WEIGHTS = {
  RCS: 0.4, // Regulatory Compliance Score — target-market sustainability law readiness
  EDS: 0.4, // ESG Disclosure Score — GRI / SASB / IFRS S1·S2 / GHG Protocol coverage
  NCS: 0.2, // Natural Capital Score — TNFD LEAP or industry baseline
} as const;

/**
 * AIV platform weights — sum = 1.00, reviewed annually by BCI methodology
 * committee based on consumer AI search market share.
 */
export const AIV_PLATFORM_WEIGHTS = {
  ChatGPT: 0.35,
  Perplexity: 0.25,
  GoogleAIOverview: 0.25,
  Claude: 0.15,
} as const;

/** Canonical formula text — display variant with middle-dot separators. */
export const BCI_FORMULA_DISPLAY = "BCI = α · FBV + β · SCV + γ · AIV";

/** Constraint annotation, useful as subtitle under the formula. */
export const BCI_CONSTRAINT = "α + β + γ = 1.00, BCI ∈ [0, 100]";

export type BCIDimensionCode = keyof typeof BCI_DIMENSIONS;
export type BCIWeightYear = keyof typeof BCI_WEIGHTS;
