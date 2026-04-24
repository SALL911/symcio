import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { FakeReport } from "./fake-data";

/**
 * Optionally enrich the template summary with a 2-sentence Gemini paragraph.
 *
 * - If GEMINI_API_KEY is set, use Vercel AI SDK → Gemini Flash (free tier).
 * - Otherwise, fall back to the deterministic template summary.
 *
 * Kept deliberately short: 2 sentences, no list, no emoji. Email templates
 * break when the model returns markdown.
 */
export async function enrichSummary(report: FakeReport): Promise<string> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
    return report.summary;
  }

  if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }

  const prompt = [
    "Write a 2-sentence executive summary for an AI Visibility report.",
    "Tone: Bloomberg-style, factual, no marketing fluff, no emoji.",
    "Language: zh-Hant (繁體中文).",
    "Never include the brand's composite score as a number — it is shown separately.",
    "",
    `Brand: ${report.brand}`,
    `Band: ${report.band}`,
    `Mention rate: ${report.mention_rate_pct}%`,
    `Top competitors present in AI answers: ${report.top_competitors.slice(0, 3).join(", ")}`,
    `Engines where the brand is missing: ${report.engines
      .filter((e) => !e.mentioned)
      .map((e) => e.engine)
      .join(", ") || "none"}`,
  ].join("\n");

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      temperature: 0.3,
    });
    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : report.summary;
  } catch {
    return report.summary;
  }
}
