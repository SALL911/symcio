/**
 * LINE Messaging API 最小 client（官方帳號自動回覆 bot）。
 *
 * 需要（LINE Developers Console → Messaging API channel）：
 *   LINE_CHANNEL_SECRET        — 驗證 webhook 簽章
 *   LINE_CHANNEL_ACCESS_TOKEN  — long-lived channel access token，用於回覆 / 讀取 profile
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.line.me/v2/bot";

export function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("base64"));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type LineMessage =
  | { type: "text"; text: string; quickReply?: { items: QuickReplyItem[] } };

export interface QuickReplyItem {
  type: "action";
  action: { type: "message"; label: string; text: string } | { type: "uri"; label: string; uri: string };
}

export async function reply(replyToken: string, messages: LineMessage[]): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "line-not-configured" };
  const resp = await fetch(`${API}/message/reply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ replyToken, messages: messages.slice(0, 5) }),
  });
  if (!resp.ok) return { ok: false, error: `HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}` };
  return { ok: true };
}

export async function getProfile(userId: string): Promise<{ displayName?: string; pictureUrl?: string; language?: string } | null> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return null;
  const resp = await fetch(`${API}/profile/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.ok ? ((await resp.json()) as { displayName?: string; pictureUrl?: string; language?: string }) : null;
}
