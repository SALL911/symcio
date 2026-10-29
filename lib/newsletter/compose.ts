/**
 * 每週電子報內容組裝。
 *
 * 來源優先順序：
 *   1. lib/news-data.ts 中 14 天內發布、且尚未寄送過的最新一期（人工審稿版，品質最高）
 *   2. Supabase news_items 近 7 天 status='published' 的條目（自動抓取版，拼接成週報）
 *   3. 都沒有 → 回 null，cron 跳過並通知管理者
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sortedEntries } from "@/lib/news-data";
import { SOCIAL_LINKS } from "@/lib/social";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

export interface Issue {
  slug: string;
  subject: string;
  preheader: string;
  /** 主文 HTML（不含頁首頁尾、退訂連結） */
  bodyHtml: string;
  url: string;
  source: "news-data" | "news-items";
}

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** ISO week label, e.g. "2026w44" */
export function isoWeekLabel(d: Date = new Date()): string {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}w${String(week).padStart(2, "0")}`;
}

async function alreadySent(sb: SupabaseClient, slug: string): Promise<boolean> {
  const { count } = await sb
    .from("newsletter_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("digest_slug", slug)
    .eq("status", "sent");
  return (count ?? 0) > 0;
}

function fromNewsData(now: Date): Omit<Issue, "source"> | null {
  const cutoff = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10);
  const entry = sortedEntries().find((e) => e.publishedAt >= cutoff);
  if (!entry) return null;
  const sections = entry.sections
    .map(
      (s) => `<h2 style="margin:24px 0 8px;font-size:17px;color:#1A2E22;">${esc(s.heading)}</h2>
${s.body.map((p) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.8;color:#374151;">${esc(p)}</p>`).join("\n")}`,
    )
    .join("\n");
  const take = entry.brandCapitalTake
    .map((p) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.8;">${esc(p)}</p>`)
    .join("\n");
  const url = `${SITE}/news/${entry.slug}`;
  return {
    slug: entry.slug,
    subject: `[Symcio 週報] ${entry.title}`,
    preheader: entry.summary.slice(0, 120),
    url,
    bodyHtml: `<p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#4B5563;">${esc(entry.summary)}</p>
${sections}
<div style="margin:24px 0;padding:16px 20px;background:#E6EEE8;border-left:3px solid #2A4D3A;">
  <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:2px;color:#2A4D3A;">BRAND CAPITAL 解讀</p>
  ${take}
</div>`,
  };
}

interface NewsItemRow {
  slug: string;
  title_zh: string;
  summary_zh: string;
  category: string;
}

async function fromNewsItems(sb: SupabaseClient, now: Date): Promise<Omit<Issue, "source"> | null> {
  const since = new Date(now.getTime() - 7 * 86400000).toISOString();
  const { data, error } = await sb
    .from("news_items")
    .select("slug, title_zh, summary_zh, category")
    .eq("status", "published")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error || !data?.length) return null;
  const week = isoWeekLabel(now);
  const rows = data as NewsItemRow[];
  const items = rows
    .map(
      (r) => `<div style="margin:16px 0;padding:14px 16px;border-left:3px solid #2A4D3A;background:#FAFAF9;">
  <p style="margin:0 0 4px;font-family:monospace;font-size:10px;letter-spacing:2px;color:#2A4D3A;">${esc(r.category.toUpperCase())}</p>
  <a href="${SITE}/news/${encodeURIComponent(r.slug)}" style="font-size:15px;font-weight:600;color:#1A2E22;text-decoration:none;">${esc(r.title_zh)}</a>
  <p style="margin:6px 0 0;font-size:13px;line-height:1.7;color:#4B5563;">${esc(r.summary_zh.slice(0, 180))}${r.summary_zh.length > 180 ? "…" : ""}</p>
</div>`,
    )
    .join("\n");
  return {
    slug: `digest-${week}`,
    subject: `[Symcio 週報] ${week.toUpperCase()} · AI 能見度與 ESG 重點 ${rows.length} 則`,
    preheader: rows[0].title_zh.slice(0, 120),
    url: `${SITE}/news`,
    bodyHtml: `<p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:#4B5563;">本週整理 ${rows.length} 則 AI 搜尋、品牌治理與 ESG 揭露相關重點。</p>\n${items}`,
  };
}

export async function composeWeeklyIssue(sb: SupabaseClient, now = new Date()): Promise<Issue | null> {
  const curated = fromNewsData(now);
  if (curated && !(await alreadySent(sb, curated.slug))) return { ...curated, source: "news-data" };
  const digest = await fromNewsItems(sb, now);
  if (digest && !(await alreadySent(sb, digest.slug))) return { ...digest, source: "news-items" };
  return null;
}

/** 外框：品牌頁首、社群連結、退訂（個資法 §20：每封行銷信須提供拒絕管道）。 */
export function wrapEmail(params: {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaUrl: string;
  ctaLabel: string;
  unsubscribeUrl?: string;
  footerNote: string;
}): string {
  const social = SOCIAL_LINKS.filter((s) => ["line", "instagram", "facebook", "threads"].includes(s.key))
    .map((s) => `<a href="${s.href}" style="color:#2A4D3A;margin-right:12px;">${esc(s.label)}</a>`)
    .join("");
  const unsub = params.unsubscribeUrl
    ? ` · <a href="${params.unsubscribeUrl}" style="color:#6B7B6F;">一鍵退訂</a>`
    : "";
  return `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(params.title)}</title></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:'IBM Plex Sans','Noto Sans TC',-apple-system,sans-serif;color:#1A2E22;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(params.preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F6F3;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E2D9;border-radius:12px;">
<tr><td style="padding:32px;">
  <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#2A4D3A;">Symcio · AI Visibility Intelligence</p>
  <h1 style="margin:0 0 16px;font-size:22px;line-height:1.4;color:#1A2E22;">${esc(params.title)}</h1>
  ${params.bodyHtml}
  <p style="margin:28px 0 0;"><a href="${params.ctaUrl}" style="display:inline-block;padding:12px 22px;background:#2A4D3A;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${esc(params.ctaLabel)}</a></p>
  <div style="margin-top:28px;padding-top:20px;border-top:1px solid #E5E2D9;font-size:12px;line-height:1.8;color:#6B7B6F;">
    <p style="margin:0 0 8px;">${social}</p>
    <p style="margin:0;">${esc(params.footerNote)}${unsub}</p>
    <p style="margin:8px 0 0;">Symcio · <a href="${SITE}" style="color:#6B7B6F;">symcio.tw</a> · 回覆本信即可聯絡我們</p>
  </div>
</td></tr></table>
</td></tr></table>
</body></html>`;
}
