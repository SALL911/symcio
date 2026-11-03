import crypto from "crypto";

/**
 * Meta (Messenger / Instagram) Graph API helpers — webhook signature check +
 * send. Returns gracefully when env is missing.
 */

const GRAPH = "https://graph.facebook.com/v19.0";

export function verifyMetaSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function verifyHandshake(params: URLSearchParams): string | null {
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export async function sendMessage(
  recipientId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "meta-not-configured" };
  try {
    const resp = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text: text.slice(0, 1900) },
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { ok: false, error: `meta HTTP ${resp.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
