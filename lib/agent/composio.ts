/**
 * Minimal Composio v3 REST client.
 *
 * Why not @composio/core SDK: that package pulls ~100 transitive deps and
 * locks us into a specific Node runtime. A fetch wrapper is 30 lines and
 * works on Vercel Edge + Node without pain.
 */

const API_BASE = "https://backend.composio.dev/api/v3";

export interface ComposioConfig {
  apiKey: string;
  userId: string;
}

function readConfig(): ComposioConfig | null {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const userId = process.env.COMPOSIO_USER_ID;
  if (!apiKey || !userId) return null;
  return { apiKey, userId };
}

export async function executeAction<TArgs extends Record<string, unknown>>(
  action: string,
  args: TArgs,
  opts: { connectedAccountId?: string } = {},
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const cfg = readConfig();
  if (!cfg) {
    return {
      ok: false,
      error: "composio-not-configured",
    };
  }

  const body: Record<string, unknown> = {
    user_id: cfg.userId,
    arguments: args,
  };
  if (opts.connectedAccountId) {
    body.connected_account_id = opts.connectedAccountId;
  }

  try {
    const resp = await fetch(`${API_BASE}/actions/${action}/execute`, {
      method: "POST",
      headers: {
        "x-api-key": cfg.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!resp.ok) {
      return { ok: false, error: `composio HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true, data: parsed };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function sendGmail(params: {
  to: string;
  subject: string;
  bodyHtml: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resp = await executeAction(
    "GMAIL_SEND_EMAIL",
    {
      recipient_email: params.to,
      subject: params.subject,
      body: params.bodyHtml,
      is_html: true,
    },
    { connectedAccountId: process.env.COMPOSIO_GMAIL_CONNECTION_ID },
  );
  return { ok: resp.ok, error: resp.error };
}

export async function saveLeadToNotion(params: {
  databaseId?: string;
  brandName: string;
  email: string;
  company?: string;
  industry?: string;
  compositeScore: number;
}): Promise<{ ok: boolean; error?: string }> {
  const databaseId = params.databaseId || process.env.COMPOSIO_NOTION_LEAD_DB_ID;
  if (!databaseId) {
    return { ok: false, error: "COMPOSIO_NOTION_LEAD_DB_ID not set" };
  }

  const resp = await executeAction(
    "NOTION_INSERT_ROW_DATABASE",
    {
      database_id: databaseId,
      properties: {
        Brand: { title: [{ text: { content: params.brandName } }] },
        Email: { email: params.email },
        Company: {
          rich_text: [{ text: { content: params.company || params.brandName } }],
        },
        Industry: {
          select: { name: params.industry || "technology" },
        },
        "Composite Score": { number: params.compositeScore },
        Source: { select: { name: "symcio.tw / Free Scan" } },
        Status: { select: { name: "New" } },
      },
    },
    { connectedAccountId: process.env.COMPOSIO_NOTION_CONNECTION_ID },
  );
  return { ok: resp.ok, error: resp.error };
}
