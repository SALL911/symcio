/**
 * Provider-agnostic send dispatcher for outbound @symcio.tw mail.
 *
 * Background: symcio.tw mailboxes are not all on one provider — info@symcio.tw
 * lives on Microsoft 365 (Outlook), and a Google mailbox may also exist. To keep
 * the server-side Sent folder in sync on whichever provider actually owns the
 * mailbox, we send through that provider's API:
 *   - "graph" → Microsoft 365 (saves to Outlook Sent Items)
 *   - "gmail" → Google Workspace / Gmail (saves to Gmail Sent)
 *
 * Selection order:
 *   1. explicit `provider` argument
 *   2. whichever provider is configured (Graph preferred, since @symcio.tw is on M365)
 */

import * as graph from "@/lib/email/graph";
import * as gmail from "@/lib/email/gmail";

export type Provider = "graph" | "gmail";

export interface SendMailParams {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  provider?: Provider;
}

export interface SendMailResult {
  ok: boolean;
  provider?: Provider;
  id?: string;
  error?: string;
}

/** Which providers currently have working credentials. */
export function configuredProviders(): Provider[] {
  const out: Provider[] = [];
  if (graph.isGraphConfigured()) out.push("graph");
  if (gmail.isGmailConfigured()) out.push("gmail");
  return out;
}

function pickProvider(explicit?: Provider): Provider | null {
  if (explicit) return explicit;
  const configured = configuredProviders();
  return configured[0] ?? null; // Graph first (see configuredProviders order)
}

export async function sendMail(params: SendMailParams): Promise<SendMailResult> {
  const provider = pickProvider(params.provider);
  if (!provider) return { ok: false, error: "no-email-provider-configured" };

  if (provider === "graph") {
    const r = await graph.send(params);
    return { ok: r.ok, provider, error: r.error };
  }
  const r = await gmail.send(params);
  return { ok: r.ok, provider, id: r.id, error: r.error };
}
