/**
 * Telegram Bot API helpers — webhook secret check + sendMessage.
 * Returns gracefully when TELEGRAM_BOT_TOKEN is missing.
 */

export function verifyTelegramSecret(headerToken: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  // If no secret is configured, accept (Telegram secret token is optional). When
  // configured, it must match the X-Telegram-Bot-Api-Secret-Token header.
  if (!expected) return true;
  return headerToken === expected;
}

export async function sendMessage(
  chatId: number | string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "telegram-not-configured" };
  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: false }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { ok: false, error: `telegram HTTP ${resp.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
