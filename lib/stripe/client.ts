import Stripe from "stripe";

/**
 * Lazy Stripe client — returns null when STRIPE_SECRET_KEY is missing.
 * Callers must handle the null case (usually: return a friendly error to UI).
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
    appInfo: {
      name: "Symcio AI Visibility",
      url: "https://symcio.tw",
    },
  });
}

export const STRIPE_PRODUCTS = {
  audit: {
    name: "AI Visibility Audit",
    description:
      "20 prompts × 4 AI engines + competitor map + improvement PDF. Delivered within 24 hours.",
    amount: 29900, // USD cents
    currency: "usd",
  },
  optimization: {
    name: "AI Visibility Optimization",
    description:
      "Audit + 90-day ranking tracking + implementation support.",
    amount: 199900,
    currency: "usd",
  },
  ebook: {
    name: "BCI 品牌資本指數 方法論電子書",
    description:
      "Brand Capital Index 完整方法論電子書（PDF）。付款後立即下載。",
    amount: 39000, // TWD is 2-decimal in Stripe → NT$390
    currency: "twd",
  },
} as const;

export type StripeProduct = keyof typeof STRIPE_PRODUCTS;
