/**
 * 每週電子報 cron — 週二 01:00 UTC（台北 09:00）。
 *
 * 1. 寄「確認訂閱」邀請給 pending（匯入聯絡人），每次最多 INVITE_CAP 封，每人只寄一次
 * 2. 組本週一期（lib/newsletter/compose.ts）
 * 3. 寄給所有 active 訂閱者（Resend batch，每批 100），寫 newsletter_deliveries
 *
 * 參數：
 *   ?preview=1  回傳本期 HTML，不寄送（審稿用）
 *   ?dry_run=1  只回統計，不寄送
 *
 * 保護：Authorization: Bearer $CRON_SECRET
 */

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { cronAuthorized } from "@/lib/cron/auth";
import { composeWeeklyIssue, wrapEmail } from "@/lib/newsletter/compose";
import { actionUrl, oneClickUrl } from "@/lib/newsletter/token";
import { sendBatch, type SendParams } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const INVITE_CAP = Number(process.env.NEWSLETTER_INVITE_CAP || 200);
const FROM = process.env.NEWSLETTER_FROM || "Symcio 週報 <newsletter@symcio.tw>";
const REPLY_TO = "info@symcio.tw";

interface Sub {
  id: string;
  email: string;
  display_name: string | null;
}

function unsubHeaders(email: string): Record<string, string> {
  // Gmail / Yahoo 2024 起對大量寄件者要求 one-click 退訂（RFC 8058）
  return {
    "List-Unsubscribe": `<${oneClickUrl(email)}>, <mailto:${REPLY_TO}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

async function chunks<T>(arr: T[], size: number, fn: (c: T[]) => Promise<void>) {
  for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size));
}

export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = adminClient();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });

  const params = new URL(req.url).searchParams;
  const preview = params.get("preview") === "1";
  const dryRun = params.get("dry_run") === "1";
  const stats = {
    issue: null as string | null,
    source: null as string | null,
    invites_sent: 0,
    invite_failures: 0,
    subscribers: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // ---------- 1. Double opt-in 邀請（匯入的聯絡人） ----------
  if (!preview && !dryRun) {
    const { data: pending, error } = await sb
      .from("newsletter_subscribers")
      .select("id, email, display_name")
      .eq("status", "pending")
      .is("invited_at", null)
      .limit(INVITE_CAP);
    if (error) stats.errors.push(`pending: ${error.message}`);
    await chunks((pending as Sub[] | null) ?? [], 100, async (batch) => {
      const msgs: SendParams[] = batch.map((s) => ({
        from: FROM,
        to: s.email,
        replyTo: REPLY_TO,
        subject: "是否要收到 Symcio 每週 AI 能見度週報？",
        headers: unsubHeaders(s.email),
        html: wrapEmail({
          title: "確認訂閱 Symcio 週報",
          preheader: "點一下確認，之後每週二收到 AI 搜尋與品牌治理重點。",
          bodyHtml: `<p style="margin:0 0 12px;font-size:14px;line-height:1.8;">${s.display_name ? `${s.display_name} 您好，` : "您好，"}</p>
<p style="margin:0 0 12px;font-size:14px;line-height:1.8;">我們是 Symcio。因為過去曾與您往來，想詢問您是否願意每週收到一封「AI 搜尋能見度 × 品牌治理」重點整理（約 3 分鐘閱讀）。</p>
<p style="margin:0 0 12px;font-size:14px;line-height:1.8;">未點擊確認，我們不會再寄送任何電子報給您。</p>`,
          ctaUrl: actionUrl("confirm", s.email),
          ctaLabel: "確認訂閱",
          unsubscribeUrl: actionUrl("unsubscribe", s.email),
          footerNote: "本信為一次性訂閱確認。",
        }),
      }));
      const results = await sendBatch(msgs);
      const okIds = batch.filter((_, i) => results[i].ok).map((s) => s.id);
      stats.invites_sent += okIds.length;
      stats.invite_failures += batch.length - okIds.length;
      results.forEach((r) => r.error && stats.errors.push(`invite: ${r.error}`));
      if (okIds.length) {
        await sb.from("newsletter_subscribers").update({ invited_at: new Date().toISOString() }).in("id", okIds);
      }
    });
  }

  // ---------- 2. 組本期 ----------
  const issue = await composeWeeklyIssue(sb);
  if (!issue) {
    return NextResponse.json({ ok: true, skipped: "no-new-issue", stats });
  }
  stats.issue = issue.slug;
  stats.source = issue.source;

  const render = (email?: string) =>
    wrapEmail({
      title: issue.subject.replace(/^\[Symcio 週報\]\s*/, ""),
      preheader: issue.preheader,
      bodyHtml: issue.bodyHtml,
      ctaUrl: issue.url,
      ctaLabel: "在網站閱讀完整內容",
      unsubscribeUrl: email ? actionUrl("unsubscribe", email) : undefined,
      footerNote: "你收到這封信，是因為你訂閱了 Symcio 週報。",
    });

  if (preview) {
    return new NextResponse(render("preview@example.com"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // ---------- 3. 寄給 active ----------
  const subs: Sub[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("newsletter_subscribers")
      .select("id, email, display_name")
      .eq("status", "active")
      .order("id")
      .range(from, from + 999);
    if (error) {
      stats.errors.push(`subscribers: ${error.message}`);
      break;
    }
    subs.push(...((data as Sub[]) ?? []));
    if (!data || data.length < 1000) break;
  }

  // cron 重跑時跳過已寄成功者
  const { data: done } = await sb
    .from("newsletter_deliveries")
    .select("subscriber_id")
    .eq("digest_slug", issue.slug)
    .eq("status", "sent");
  const doneSet = new Set(((done as { subscriber_id: string }[] | null) ?? []).map((d) => d.subscriber_id));
  const targets = subs.filter((s) => !doneSet.has(s.id));
  stats.subscribers = subs.length;

  if (dryRun) return NextResponse.json({ ok: true, dry_run: true, to_send: targets.length, stats });

  await chunks(targets, 100, async (batch) => {
    const results = await sendBatch(
      batch.map((s) => ({
        from: FROM,
        to: s.email,
        replyTo: REPLY_TO,
        subject: issue.subject,
        html: render(s.email),
        headers: unsubHeaders(s.email),
      })),
    );
    const now = new Date().toISOString();
    const { error } = await sb.from("newsletter_deliveries").upsert(
      batch.map((s, i) => ({
        subscriber_id: s.id,
        digest_slug: issue.slug,
        sent_at: now,
        status: results[i].ok ? "sent" : "failed",
        resend_id: results[i].id ?? null,
        error: results[i].error ?? null,
      })),
      { onConflict: "subscriber_id,digest_slug" },
    );
    if (error) stats.errors.push(`deliveries: ${error.message}`);
    results.forEach((r) => (r.ok ? stats.sent++ : stats.failed++));
    const firstErr = results.find((r) => r.error)?.error;
    if (firstErr) stats.errors.push(`send: ${firstErr}`);
  });

  return NextResponse.json({ ok: stats.failed === 0, stats });
}
