import crypto from "crypto";

/**
 * LINE Messaging API helpers — signature verification + reply.
 * Returns gracefully when env (LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN)
 * is missing so the webhook can no-op instead of crashing.
 */

const REPLY_API = "https://api.line.me/v2/bot/message/reply";

export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  // Length-safe comparison.
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function replyText(
  replyToken: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "line-not-configured" };
  try {
    const resp = await fetch(REPLY_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { ok: false, error: `line HTTP ${resp.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
