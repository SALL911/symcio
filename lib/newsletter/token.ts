/**
 * 電子報退訂 / 確認連結簽章。
 *
 * 以 HMAC-SHA256(NEWSLETTER_SECRET, `${action}:${email}`) 簽章，連結無需查 DB 即可驗證，
 * 也不必為每位訂閱者存 token。NEWSLETTER_SECRET 輪替會讓舊信件中的連結失效，勿隨意更換。
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export type TokenAction = "unsubscribe" | "confirm";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

function secret(): string {
  const s = process.env.NEWSLETTER_SECRET;
  if (!s || s.length < 16) throw new Error("NEWSLETTER_SECRET missing or shorter than 16 chars");
  return s;
}

export function sign(action: TokenAction, email: string): string {
  return createHmac("sha256", secret())
    .update(`${action}:${email.toLowerCase()}`)
    .digest("base64url");
}

export function verify(action: TokenAction, email: string, token: string): boolean {
  try {
    const a = Buffer.from(sign(action, email));
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function encodeEmail(email: string): string {
  return Buffer.from(email.toLowerCase(), "utf8").toString("base64url");
}

export function decodeEmail(e: string): string | null {
  try {
    const v = Buffer.from(e, "base64url").toString("utf8");
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

/** 頁面連結（瀏覽器點擊）。 */
export function actionUrl(action: TokenAction, email: string): string {
  return `${SITE}/newsletter/${action}?e=${encodeEmail(email)}&t=${sign(action, email)}`;
}

/** RFC 8058 one-click 退訂端點（List-Unsubscribe-Post 用）。 */
export function oneClickUrl(email: string): string {
  return `${SITE}/api/newsletter/unsubscribe?e=${encodeEmail(email)}&t=${sign("unsubscribe", email)}`;
}
