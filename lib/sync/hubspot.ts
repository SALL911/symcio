/**
 * HubSpot contact upsert（以 email 為唯一鍵）。
 *
 * 需要 HUBSPOT_PRIVATE_APP_TOKEN（Private App，scope: crm.objects.contacts.read/write）。
 * 自訂屬性 symcio_* 若尚未在 HubSpot 建立，會自動退回只寫標準欄位，不讓註冊流程失敗。
 * 建立自訂屬性：`node scripts/hubspot-setup-properties.mjs`。
 */

import type { MemberRecord, SyncResult } from "./types";

const API = "https://api.hubapi.com";

function splitName(name?: string | null): { firstname?: string; lastname?: string } {
  if (!name) return {};
  const trimmed = name.trim();
  // 中文姓名不拆；英文以最後一個空白拆成 first / last
  if (!/\s/.test(trimmed)) return { firstname: trimmed };
  const idx = trimmed.lastIndexOf(" ");
  return { firstname: trimmed.slice(0, idx), lastname: trimmed.slice(idx + 1) };
}

async function upsert(token: string, properties: Record<string, string>) {
  return fetch(`${API}/crm/v3/objects/contacts/batch/upsert`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: [{ idProperty: "email", id: properties.email, properties }],
    }),
  });
}

export async function syncToHubSpot(m: MemberRecord): Promise<SyncResult> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) return { target: "hubspot", status: "skipped", error: "hubspot-not-configured" };

  const standard: Record<string, string> = {
    email: m.email.toLowerCase(),
    ...Object.fromEntries(
      Object.entries({
        ...splitName(m.name),
        company: m.company ?? undefined,
        jobtitle: m.title ?? undefined,
      }).filter(([, v]) => typeof v === "string" && v.length > 0),
    ) as Record<string, string>,
  };
  const custom: Record<string, string> = {
    symcio_signup_source: m.source,
    symcio_member_plan: m.plan ?? "",
  };

  try {
    let resp = await upsert(token, { ...standard, ...custom });
    if (resp.status === 400) {
      const body = await resp.text();
      if (/PROPERTY_DOESNT_EXIST|does not exist/i.test(body)) {
        resp = await upsert(token, standard);
      } else {
        return { target: "hubspot", status: "failed", error: `HTTP 400: ${body.slice(0, 200)}` };
      }
    }
    const text = await resp.text();
    if (!resp.ok) {
      return { target: "hubspot", status: "failed", error: `HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    const id = (JSON.parse(text) as { results?: { id?: string }[] }).results?.[0]?.id;
    return { target: "hubspot", status: "ok", externalId: id };
  } catch (err) {
    return { target: "hubspot", status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
