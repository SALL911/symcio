/**
 * newsletter_subscribers 狀態機（個資法 §19/§20 行銷同意）：
 *
 *   pending      ← 匯入的聯絡人（未取得明確同意）。只會收到一次「確認訂閱」邀請信。
 *   active       ← 本人在網站勾選 / 點確認連結。每週收電子報。
 *   unsubscribed ← 本人退訂。任何自動流程不得改回 active，只有本人再次訂閱才可。
 *   bounced / complained ← Resend webhook 回報，停止寄送。
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriberStatus = "pending" | "active" | "unsubscribed" | "bounced" | "complained";

export interface SubscriberInput {
  email: string;
  displayName?: string | null;
  source: string;
  attribution?: Record<string, unknown> | null;
}

/** 本人明確訂閱（網站表單 / 註冊勾選 / 點確認連結）：建立或恢復為 active。 */
export async function subscribe(sb: SupabaseClient, s: SubscriberInput) {
  const now = new Date().toISOString();
  return sb.from("newsletter_subscribers").upsert(
    {
      email: s.email.toLowerCase(),
      display_name: s.displayName ?? null,
      source: s.source,
      status: "active",
      subscribed_at: now,
      unsubscribed_at: null,
      consent_at: now,
      consent_source: s.source,
      attribution: s.attribution ?? null,
      updated_at: now,
    },
    { onConflict: "email" },
  );
}

/** 匯入聯絡人：只新增 pending，已存在者（含 unsubscribed）一律不動。 */
export async function importPending(sb: SupabaseClient, rows: SubscriberInput[]) {
  return sb.from("newsletter_subscribers").upsert(
    rows.map((s) => ({
      email: s.email.toLowerCase(),
      display_name: s.displayName ?? null,
      source: s.source,
      status: "pending",
    })),
    { onConflict: "email", ignoreDuplicates: true },
  );
}

export async function unsubscribe(sb: SupabaseClient, email: string) {
  const now = new Date().toISOString();
  return sb
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: now, updated_at: now })
    .eq("email", email.toLowerCase())
    .neq("status", "unsubscribed");
}

/** 確認連結：只有 pending → active；已退訂者需本人到網站重新訂閱。 */
export async function confirmPending(sb: SupabaseClient, email: string) {
  const now = new Date().toISOString();
  return sb
    .from("newsletter_subscribers")
    .update({
      status: "active",
      subscribed_at: now,
      consent_at: now,
      consent_source: "double-opt-in",
      updated_at: now,
    })
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .select("id");
}
