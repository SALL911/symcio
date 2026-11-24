import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { send as sendEmail } from "@/lib/email/resend";
import { sendCapiEvent } from "@/lib/meta/capi";
import { gradeLead, type GradeResult } from "@/lib/ai/grade";
import { startFollowups } from "@/lib/followup/schedule";

// 名單擷取的單一入口：Supabase 寫入 + AI 分級 + Email 即時通知 + Meta Conversions API。
// 設計原則：任何一條管道失敗都不能讓名單消失。
// Supabase 未設定或寫入失敗時，只要通知信寄得出去，名單就還在信箱裡。

export type LeadAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  first_landing_url?: string;
  first_touch_at?: string;
  fbclid?: string;
  gclid?: string;
  li_fat_id?: string;
};

export type LeadInput = {
  source: string; // leads.source，例："audit-form" / "service-form"
  name: string;
  company: string;
  email: string;
  notes: string;
  attribution?: LeadAttribution;
  metaEventId?: string;
  metaContentName: string;
  /** 是否寄確認信給名單本人並啟動跟進排程（已有自己確認流程的表單設 false） */
  confirm?: boolean;
};

export type LeadResult = {
  ok: boolean;
  stored: boolean; // 已寫入 Supabase
  notified: boolean; // 已寄出通知信
  grade?: string; // A / B / C
  error?: string;
};

export function leadsSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function notify(lead: LeadInput, stored: boolean, g: GradeResult | null): Promise<boolean> {
  const to = process.env.LEAD_NOTIFY_EMAIL?.trim() || "info@symcio.tw";
  const from = process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>";
  const a = lead.attribution || {};
  const rows: [string, string][] = [
    ["分級", g ? `${g.grade}（${g.intent}，${g.by === "ai" ? "AI" : "規則"}判定）` : ""],
    ["摘要", g?.summary || ""],
    ["來源表單", lead.source],
    ["姓名", lead.name],
    ["公司 / 品牌", lead.company],
    ["Email", lead.email],
    ["內容", lead.notes],
    ["UTM", [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean).join(" / ")],
    ["Referrer", a.referrer || ""],
    ["資料庫", stored ? "已寫入 Supabase" : "未寫入（Supabase 未設定或寫入失敗）— 這封信是唯一紀錄"],
  ];
  const html = `<!DOCTYPE html><html lang="zh-Hant"><body style="font-family:-apple-system,Segoe UI,Noto Sans TC,sans-serif;color:#0B0F19;">
<h2 style="font-size:18px;">新名單：${esc(lead.company || lead.name)}</h2>
<table cellpadding="6" style="border-collapse:collapse;font-size:14px;">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="color:#6B7280;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td>${esc(v)}</td></tr>`,
    )
    .join("")}</table>
${g ? `<h3 style="font-size:14px;margin-top:20px;">建議下一步（內部參考，請勿直接轉寄）</h3><pre style="font-family:inherit;font-size:14px;white-space:pre-wrap;background:#F7F6F3;padding:12px;border-radius:8px;">${esc(g.script)}</pre>` : ""}
<p style="font-size:12px;color:#6B7280;">直接回覆這封信即可回給對方。</p>
</body></html>`;
  const res = await sendEmail({
    from,
    to,
    subject: `[Symcio 新名單${g ? `｜${g.grade} 級` : ""}] ${lead.company || lead.name}（${lead.source}）`,
    html,
    replyTo: lead.email,
  });
  if (!res.ok) console.error("[leads] notify failed", res.error);
  return res.ok;
}

export async function captureLead(req: Request, lead: LeadInput): Promise<LeadResult> {
  const a = lead.attribution || {};
  let stored = false;
  let error: string | undefined;

  let leadId: string | undefined;

  const sb = leadsSupabase();
  if (sb) {
    const { data: row, error: dbErr } = await sb.from("leads").insert({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      source: lead.source,
      status: "new",
      notes: lead.notes,
      utm_source: a.utm_source,
      utm_medium: a.utm_medium,
      utm_campaign: a.utm_campaign,
      utm_content: a.utm_content,
      utm_term: a.utm_term,
      referrer: a.referrer,
      first_landing_url: a.first_landing_url,
      first_touch_at: a.first_touch_at ?? null,
      fbclid: a.fbclid,
      gclid: a.gclid,
      li_fat_id: a.li_fat_id,
    }).select("id").maybeSingle();
    leadId = (row?.id as string | undefined) ?? undefined;
    if (dbErr) {
      console.error(`[leads] insert failed (${lead.source})`, dbErr);
      error = dbErr.message;
    } else {
      stored = true;
    }
  } else {
    error = "supabase-not-configured";
  }

  // 分級：規則一定有結果，AI 逾時或失敗時自動退回規則。失敗不影響名單擷取。
  let grade: GradeResult | null = null;
  try {
    grade = await gradeLead({
      source: lead.source,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      notes: lead.notes,
      utm_source: a.utm_source,
    });
  } catch (err) {
    console.error("[leads] grading failed", err);
  }

  // 通知信、CAPI、分級回寫、確認信互不依賴，平行送出
  const [notified] = await Promise.all([
    notify(lead, stored, grade),
    sb && leadId && grade
      ? sb
          .from("leads")
          .update({
            grade: grade.grade,
            intent: grade.intent,
            ai_summary: grade.summary,
            sales_script: grade.script,
            graded_at: new Date().toISOString(),
          })
          .eq("id", leadId)
          .then(({ error: e }) => {
            if (e) console.error("[leads] grade write failed", e.message);
          })
      : Promise.resolve(),
    lead.confirm
      ? startFollowups(stored ? sb : null, { id: leadId, name: lead.name, company: lead.company, email: lead.email }).catch(
          (err) => console.error("[leads] followup failed", err),
        )
      : Promise.resolve(),
    sendCapiEvent(req, {
      eventName: "Lead",
      eventId: lead.metaEventId,
      email: lead.email,
      fbclid: a.fbclid,
      customData: { content_name: lead.metaContentName },
    }),
  ]);

  const ok = stored || notified;
  return { ok, stored, notified, grade: grade?.grade, error: ok ? undefined : error };
}
