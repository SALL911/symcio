/**
 * Deterministic fake report generator.
 *
 * Why fake first: user research (don't wait 3 minutes for real API calls,
 * don't burn Gemini quota on leads that won't convert). Real Gemini / Claude /
 * OpenAI / Perplexity calls are wired in scripts/geo_audit.py and the
 * `geo-audit.yml` workflow; those run daily for paying customers.
 *
 * Output is seeded from the brand name so the same input yields the same
 * report — important for demos and for the sales team being able to reproduce.
 */

export interface EngineResult {
  engine: "chatgpt" | "claude" | "gemini" | "perplexity";
  mentioned: boolean;
  rank: number | null;
  sentiment: "positive" | "neutral" | "negative";
  competitors: string[];
}

export interface FakeReport {
  brand: string;
  generated_at: string;
  composite_score: number;
  band: "Invisible" | "Emerging" | "Competitive" | "Dominant";
  mention_rate_pct: number;
  top_competitors: string[];
  engines: EngineResult[];
  summary: string;
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

const SAMPLE_COMPETITORS = [
  "Ahrefs",
  "SEMrush",
  "SimilarWeb",
  "Moz",
  "BrightEdge",
  "Conductor",
  "seoClarity",
  "Clearscope",
  "Frase",
  "Surfer SEO",
];

const BAND_TEMPLATES: Record<FakeReport["band"], string> = {
  Invisible:
    "{brand} currently has near-zero presence inside AI answer engines. When a buyer asks ChatGPT or Claude about your category, your brand is effectively absent. This is the category most new audits fall into — and the one with the highest upside if corrected within 30 days.",
  Emerging:
    "{brand} is mentioned occasionally but rarely ranked in the top positions. Competitors dominate the list-style answers. The next 60 days should focus on structured content that AI engines can cite directly.",
  Competitive:
    "{brand} is consistently on the radar of every major AI engine and frequently ranks in the top 3. Remaining work: close the sentiment gap and own two specific narrative attributes.",
  Dominant:
    "{brand} is the default answer in most category queries across all four AI engines. Focus shifts to defensive moves: protecting the narrative and monitoring competitor catch-up.",
};

function bandFor(score: number): FakeReport["band"] {
  if (score >= 75) return "Dominant";
  if (score >= 50) return "Competitive";
  if (score >= 25) return "Emerging";
  return "Invisible";
}

export function generateFakeReport(brand: string): FakeReport {
  const trimmed = brand.trim();
  const seed = hash32(trimmed.toLowerCase());

  const mentionRate = 5 + (seed % 60); // 5 .. 64
  const compositeBase = Math.floor(mentionRate * 0.9);
  const composite = Math.max(0, Math.min(100, compositeBase + ((seed >> 8) % 20) - 5));

  const engines: EngineResult[] = (
    ["chatgpt", "claude", "gemini", "perplexity"] as const
  ).map((engine, idx) => {
    const localSeed = seed + idx * 7919;
    const mentioned = ((localSeed >> 3) % 100) < mentionRate;
    const rank = mentioned ? 1 + ((localSeed >> 5) % 9) : null;
    const sentiment: EngineResult["sentiment"] = mentioned
      ? pick(["positive", "neutral", "neutral", "neutral", "negative"] as const, localSeed >> 7)
      : "neutral";
    const competitorCount = 3 + (localSeed % 3);
    const competitors = Array.from({ length: competitorCount }, (_, i) =>
      pick(SAMPLE_COMPETITORS, localSeed + i * 31),
    ).filter((c, i, arr) => arr.indexOf(c) === i);
    return { engine, mentioned, rank, sentiment, competitors };
  });

  const allCompetitors = Array.from(new Set(engines.flatMap((e) => e.competitors)));
  const band = bandFor(composite);
  const summary = BAND_TEMPLATES[band].replaceAll("{brand}", trimmed);

  return {
    brand: trimmed,
    generated_at: new Date().toISOString(),
    composite_score: composite,
    band,
    mention_rate_pct: mentionRate,
    top_competitors: allCompetitors.slice(0, 5),
    engines,
    summary,
  };
}
