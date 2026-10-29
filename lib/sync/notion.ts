/**
 * Notion 會員資料庫 upsert（以 Email 欄位比對）。
 *
 * 需要：
 *   NOTION_API_KEY         — Internal integration token，且該 integration 已被加入資料庫的 Connections
 *   NOTION_MEMBERS_DB_ID   — 會員資料庫 ID
 *
 * 資料庫欄位（名稱需一致）：
 *   Name (title) · Email (email) · Company (rich_text) · Source (select)
 *   Plan (select) · Newsletter (checkbox) · Signed Up (date) · Supabase ID (rich_text)
 */

import type { MemberRecord, SyncResult } from "./types";

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": VERSION,
    "Content-Type": "application/json",
  };
}

const text = (v?: string | null) => ({ rich_text: v ? [{ text: { content: v.slice(0, 2000) } }] : [] });

function properties(m: MemberRecord) {
  return {
    Name: { title: [{ text: { content: (m.name || m.email.split("@")[0]).slice(0, 200) } }] },
    Email: { email: m.email.toLowerCase() },
    Company: text(m.company),
    Source: { select: { name: m.source } },
    Plan: { select: { name: m.plan || "free" } },
    Newsletter: { checkbox: !!m.newsletterOptIn },
    "Signed Up": { date: { start: m.createdAt } },
    "Supabase ID": text(m.supabaseId),
  };
}

export async function syncToNotion(m: MemberRecord): Promise<SyncResult> {
  const token = process.env.NOTION_API_KEY;
  const db = process.env.NOTION_MEMBERS_DB_ID;
  if (!token || !db) return { target: "notion", status: "skipped", error: "notion-not-configured" };

  try {
    const q = await fetch(`${API}/databases/${db}/query`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({
        filter: { property: "Email", email: { equals: m.email.toLowerCase() } },
        page_size: 1,
      }),
    });
    const qText = await q.text();
    if (!q.ok) return { target: "notion", status: "failed", error: `query HTTP ${q.status}: ${qText.slice(0, 200)}` };
    const existing = (JSON.parse(qText) as { results?: { id: string }[] }).results?.[0]?.id;

    const resp = existing
      ? await fetch(`${API}/pages/${existing}`, {
          method: "PATCH",
          headers: headers(token),
          body: JSON.stringify({ properties: properties(m) }),
        })
      : await fetch(`${API}/pages`, {
          method: "POST",
          headers: headers(token),
          body: JSON.stringify({ parent: { database_id: db }, properties: properties(m) }),
        });
    const body = await resp.text();
    if (!resp.ok) return { target: "notion", status: "failed", error: `HTTP ${resp.status}: ${body.slice(0, 200)}` };
    return { target: "notion", status: "ok", externalId: (JSON.parse(body) as { id?: string }).id };
  } catch (err) {
    return { target: "notion", status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
