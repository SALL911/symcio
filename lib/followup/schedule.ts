import type { SupabaseClient } from "@supabase/supabase-js";
import { send as sendEmail } from "@/lib/email/resend";
import { renderFollowup, SEQUENCE_STEPS, type FollowupStep } from "./templates";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";
const FROM = () => process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";

/** d2 / d5 行銷跟進信的總開關。預設關閉：表單同意文字涵蓋後續聯絡後才可開啟。 */
export function sequenceEnabled(): boolean {
  return process.env.FOLLOWUP_SEQUENCE_ENABLED === "true";
}

export function unsubscribeUrl(token: string): string {
  return `${SITE}/api/followups/unsubscribe?t=${encodeURIComponent(token)}`;
}

/** 表單送出後立即寄 d0 確認信，並在開關開啟時排入 d2 / d5。任何失敗都不拋錯。 */
export async function startFollowups(
  sb: SupabaseClient | null,
  lead: { id?: string; name: string; company: string; email: string },
): Promise<{ confirmed: boolean }> {
  const { subject, html } = renderFollowup("d0", lead);
  const res = await sendEmail({ from: FROM(), to: lead.email, subject, html, replyTo: "info@symcio.tw" });
  if (!res.ok) console.error("[followup] d0 failed", res.error);

  if (sb && lead.id) {
    const now = Date.now();
    const rows: Record<string, unknown>[] = [
      {
        lead_id: lead.id,
        step: "d0",
        due_at: new Date(now).toISOString(),
        status: res.ok ? "sent" : "failed",
        sent_at: res.ok ? new Date(now).toISOString() : null,
        error: res.ok ? null : (res.error || "").slice(0, 300),
      },
    ];
    if (sequenceEnabled()) {
      for (const s of SEQUENCE_STEPS) {
        rows.push({
          lead_id: lead.id,
          step: s.step,
          due_at: new Date(now + s.afterDays * 86400_000).toISOString(),
          status: "pending",
        });
      }
    }
    const { error } = await sb.from("lead_followups").upsert(rows, { onConflict: "lead_id,step", ignoreDuplicates: true });
    if (error) console.error("[followup] schedule failed", error.message);
  }
  return { confirmed: res.ok };
}

type DueRow = {
  id: string;
  due_at: string;
  step: FollowupStep;
  leads: {
    name: string | null;
    company: string | null;
    email: string | null;
    status: string | null;
    followup_opt_out: boolean | null;
    unsubscribe_token: string | null;
  } | null;
};

// 這些狀態代表已有人工接手或已結案，不再自動寄信
const STOP_STATUSES = new Set(["contacted", "qualified", "converted", "lost", "unsubscribed"]);

/** 處理到期的跟進信。由 /api/cron/followups 每日呼叫。 */
export async function runDueFollowups(sb: SupabaseClient, limit = 50) {
  const out = { due: 0, sent: 0, skipped: 0, failed: 0, enabled: sequenceEnabled() };
  if (!out.enabled) return out;

  const { data, error } = await sb
    .from("lead_followups")
    .select("id, step, due_at, leads(name, company, email, status, followup_opt_out, unsubscribe_token)")
    .eq("status", "pending")
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as DueRow[];
  out.due = rows.length;
  for (const row of rows) {
    const lead = row.leads;
    const mark = (patch: Record<string, unknown>) => sb.from("lead_followups").update(patch).eq("id", row.id);

    if (!lead?.email || !lead.unsubscribe_token || lead.followup_opt_out || STOP_STATUSES.has(lead.status || "")) {
      await mark({ status: "skipped" });
      out.skipped++;
      continue;
    }
    const { subject, html } = renderFollowup(row.step, {
      name: lead.name || "",
      company: lead.company || "",
      unsubscribeUrl: unsubscribeUrl(lead.unsubscribe_token),
    });
    const res = await sendEmail({ from: FROM(), to: lead.email, subject, html, replyTo: "info@symcio.tw" });
    if (res.ok) {
      await mark({ status: "sent", sent_at: new Date().toISOString() });
      out.sent++;
    } else {
      // 寄送失敗先保留 pending，隔天排程再試；逾期超過 3 天才放棄，避免過時的信被補寄
      const stale = Date.now() - new Date(row.due_at).getTime() > 3 * 86400_000;
      await mark({ status: stale ? "failed" : "pending", error: (res.error || "").slice(0, 300) });
      out.failed++;
    }
  }
  return out;
}
