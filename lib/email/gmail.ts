/**
 * Minimal Gmail API client — send mail AS a real @symcio.tw mailbox.
 *
 * Why this exists (and why not just Resend):
 *   Resend (lib/email/resend.ts) is great for transactional blasts, but mail it
 *   sends never appears in your Google Workspace "Sent" folder. That is exactly
 *   why your sent-items look different on phone Outlook / desktop Outlook /
 *   Gmail — each client only sees what *it* sent. The Gmail API instead drops a
 *   copy straight into the sending mailbox's Sent folder on the server, so every
 *   device that syncs that mailbox (IMAP) shows the same, single source of truth.
 *
 * Why no googleapis SDK: same philosophy as resend.ts — a couple of fetch calls
 * plus node:crypto for JWT signing does the whole job with zero extra deps.
 *
 * Two auth modes (auto-detected from env):
 *   1. Service account + domain-wide delegation  [recommended for a domain]
 *      GMAIL_SERVICE_ACCOUNT_JSON = full service-account JSON (one line)
 *      Lets us impersonate ANY mailbox in symcio.tw (info@, sall@, ...), so the
 *      Sent copy lands in the right person's mailbox automatically.
 *   2. OAuth refresh token  [single mailbox fallback]
 *      GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN
 *      Sends only as that one authorized account (or its "send mail as" alias).
 *
 * If nothing is configured, send() returns ok:false with a graceful error code.
 */

import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/gmail.send";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

export interface GmailSendParams {
  /** Real mailbox in the domain, e.g. "info@symcio.tw" or "sall@symcio.tw".
   *  May include a display name: "Symcio <info@symcio.tw>". */
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface GmailSendResult {
  ok: boolean;
  id?: string;
  threadId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// base64url helpers
// ---------------------------------------------------------------------------

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---------------------------------------------------------------------------
// Access-token acquisition (cached per impersonated mailbox)
// ---------------------------------------------------------------------------

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}
const tokenCache = new Map<string, CachedToken>();

function extractEmail(addr: string): string {
  const m = addr.match(/<([^>]+)>/);
  return (m ? m[1] : addr).trim();
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.GMAIL_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.client_email || !parsed.private_key) return null;
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  } catch {
    return null;
  }
}

/** Domain-wide-delegation JWT → access token, impersonating `subject`. */
async function tokenViaServiceAccount(sa: ServiceAccount, subject: string): Promise<string> {
  const cacheKey = `sa:${subject}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: sa.client_email,
      sub: subject, // impersonate this mailbox → Sent copy lands here
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const signature = base64url(
    crypto.createSign("RSA-SHA256").update(signingInput).sign(sa.private_key),
  );
  const assertion = `${signingInput}.${signature}`;

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = (await resp.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!resp.ok || !data.access_token) {
    throw new Error(`gmail token (service-account): ${data.error_description || data.error || resp.status}`);
  }
  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  });
  return data.access_token;
}

/** OAuth refresh token → access token (single authorized mailbox). */
async function tokenViaRefreshToken(): Promise<string> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("gmail-not-configured");

  const cacheKey = "refresh";
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = (await resp.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!resp.ok || !data.access_token) {
    throw new Error(`gmail token (refresh): ${data.error_description || data.error || resp.status}`);
  }
  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  });
  return data.access_token;
}

/** True when at least one Gmail auth mode is configured. */
export function isGmailConfigured(): boolean {
  return Boolean(
    loadServiceAccount() ||
      (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN),
  );
}

// ---------------------------------------------------------------------------
// MIME assembly
// ---------------------------------------------------------------------------

/** RFC 2047 encode any header value that contains non-ASCII (e.g. 中文 subject). */
function encodeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

function joinAddrs(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v.join(", ") : v;
}

function buildMime(p: GmailSendParams): string {
  const to = joinAddrs(p.to);
  const cc = joinAddrs(p.cc);
  const bcc = joinAddrs(p.bcc);
  const headers: string[] = [
    `From: ${p.from}`,
    to ? `To: ${to}` : "",
    cc ? `Cc: ${cc}` : "",
    bcc ? `Bcc: ${bcc}` : "",
    p.replyTo ? `Reply-To: ${p.replyTo}` : "",
    `Subject: ${encodeHeader(p.subject)}`,
    "MIME-Version: 1.0",
  ].filter(Boolean);

  const hasHtml = Boolean(p.html);
  const hasText = Boolean(p.text);

  if (hasHtml && hasText) {
    const boundary = `=_symcio_${crypto.randomBytes(12).toString("hex")}`;
    return [
      ...headers,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(p.text!, "utf-8").toString("base64"),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(p.html!, "utf-8").toString("base64"),
      `--${boundary}--`,
      "",
    ].join("\r\n");
  }

  const body = hasHtml ? p.html! : p.text ?? "";
  const contentType = hasHtml ? "text/html" : "text/plain";
  return [
    ...headers,
    `Content-Type: ${contentType}; charset=UTF-8`,
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(body, "utf-8").toString("base64"),
    "",
  ].join("\r\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an email via the Gmail API as `params.from`. The message is stored in
 * that mailbox's Sent folder server-side, so it stays in sync across all
 * devices/clients that connect to it.
 */
export async function send(params: GmailSendParams): Promise<GmailSendResult> {
  const senderEmail = extractEmail(params.from);

  let accessToken: string;
  try {
    const sa = loadServiceAccount();
    accessToken = sa ? await tokenViaServiceAccount(sa, senderEmail) : await tokenViaRefreshToken();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const raw = base64url(buildMime(params));

  try {
    // userId "me" resolves to the token's authorized/impersonated mailbox.
    const resp = await fetch(`${GMAIL_API}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });
    const text = await resp.text();
    if (!resp.ok) return { ok: false, error: `gmail HTTP ${resp.status}: ${text.slice(0, 300)}` };
    const parsed = JSON.parse(text) as { id?: string; threadId?: string };
    return { ok: true, id: parsed.id, threadId: parsed.threadId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
