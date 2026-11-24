import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// AI 模型的單一入口。沿用既有的 Vercel AI SDK + Gemini。
// 未設定金鑰、逾時或出錯一律回 null，呼叫端必須有不靠 AI 的備援。

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export function aiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY);
}

export async function aiText(params: {
  system: string;
  prompt: string;
  timeoutMs?: number;
  maxOutputTokens?: number;
}): Promise<string | null> {
  if (!aiConfigured()) return null;
  if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }
  try {
    const { text } = await generateText({
      model: google(MODEL),
      system: params.system,
      prompt: params.prompt,
      temperature: 0.3,
      maxOutputTokens: params.maxOutputTokens ?? 600,
      abortSignal: AbortSignal.timeout(params.timeoutMs ?? 6000),
    });
    const out = text.trim();
    return out.length > 0 ? out : null;
  } catch (err) {
    console.error("[ai] generate failed", err instanceof Error ? err.message : err);
    return null;
  }
}
