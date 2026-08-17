/**
 * Minimal Microsoft Graph mail sender — send AS a real @symcio.tw mailbox that
 * lives on Microsoft 365 (Outlook / Exchange Online).
 *
 * Why this exists: diagnostics showed info@symcio.tw is hosted on Microsoft 365
 * (its messages carry *.PROD.OUTLOOK.COM message-ids), and the user's phone &
 * desktop Outlook already sync that mailbox's Sent Items. Sending via Graph with
 * saveToSentItems:true drops the copy straight into that server-side Sent folder,
 * so every Outlook client shows the same sent history — the actual fix for the
 * "sent backups don't match" problem on the Microsoft side.
 *
 * Why no SDK: same philosophy as resend.ts / gmail.ts — a token call plus one
 * sendMail POST with fetch does the whole job, zero extra deps.
 *
 * Auth: Azure AD app-only (client credentials). Register an app, grant the
 * APPLICATION permission Mail.Send (admin consent), then set:
 *   GRAPH_TENANT_ID / GRAPH_CLIENT_ID / GRAPH_CLIENT_SECRET
 * App-only Mail.Send can send as any mailbox in the tenant (info@, sall@), so
 * each Sent copy lands in the right mailbox. Optionally scope it down with an
 * Exchange ApplicationAccessPolicy.
 *
 * If unconfigured, send() returns ok:false with a graceful error code.
 */

const GRAPH = "https://graph.microsoft.com/v1.0";

export interface GraphSendParams {
  /** Real mailbox in the tenant, e.g. "info@symcio.tw". A display name may be
   *  included ("Symcio <info@symcio.tw>"); only the address is used for routing. */
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface GraphSendResult {
  ok: boolean;
  error?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}
let cachedToken: CachedToken | null = null;

function extractEmail(addr: string): string {
  const m = addr.match(/<([^>]+)>/);
  return (m ? m[1] : addr).trim();
}

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).map(extractEmail).filter(Boolean);
}

function recipients(v: string | string[] | undefined) {
  return asList(v).map((address) => ({ emailAddress: { address } }));
}

/** True when Graph app-only auth is configured. */
export function isGraphConfigured(): boolean {
  return Boolean(process.env.GRAPH_TENANT_ID && process.env.GRAPH_CLIENT_ID && process.env.GRAPH_CLIENT_SECRET);
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const tenant = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
  if (!tenant || !clientId || !clientSecret) throw new Error("graph-not-configured");

  const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    }),
  });
  const data = (await resp.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!resp.ok || !data.access_token) {
    throw new Error(`graph token: ${data.error_description || data.error || resp.status}`);
  }
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

/**
 * Send an email via Microsoft Graph as `params.from`. With saveToSentItems the
 * message is stored in that mailbox's Sent Items on the server, keeping every
 * Outlook client (phone + desktop) in sync.
 */
export async function send(params: GraphSendParams): Promise<GraphSendResult> {
  const sender = extractEmail(params.from);

  let token: string;
  try {
    token = await getToken();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const body = params.html
    ? { contentType: "HTML", content: params.html }
    : { contentType: "Text", content: params.text ?? "" };

  const payload = {
    message: {
      subject: params.subject,
      body,
      toRecipients: recipients(params.to),
      ccRecipients: recipients(params.cc),
      bccRecipients: recipients(params.bcc),
      ...(params.replyTo ? { replyTo: recipients(params.replyTo) } : {}),
    },
    saveToSentItems: true,
  };

  try {
    const resp = await fetch(`${GRAPH}/users/${encodeURIComponent(sender)}/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    // Graph sendMail returns 202 Accepted with an empty body on success.
    if (resp.status === 202) return { ok: true };
    const text = await resp.text();
    return { ok: false, error: `graph HTTP ${resp.status}: ${text.slice(0, 300)}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
