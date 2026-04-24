import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { generate, OrgType } from "@/lib/schema/generator";
import { saveLeadToNotion, sendGmail } from "@/lib/agent/composio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const OrgTypeSchema = z.enum([
  "Organization",
  "Corporation",
  "LocalBusiness",
  "EducationalOrganization",
  "GovernmentOrganization",
  "NGO",
]);

const AttributionSchema = z
  .object({
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
    utm_term: z.string().max(200).optional(),
    referrer: z.string().max(500).optional(),
    first_landing_url: z.string().max(500).optional(),
    first_touch_at: z.string().optional(),
    fbclid: z.string().max(200).optional(),
    gclid: z.string().max(200).optional(),
    li_fat_id: z.string().max(200).optional(),
  })
  .optional()
  .default({});

const RequestSchema = z.object({
  brandName: z.string().trim().min(1).max(200),
  legalName: z.string().trim().max(200).optional().default(""),
  url: z.string().trim().max(500).optional().default(""),
  logoUrl: z.string().trim().max(500).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  orgType: OrgTypeSchema.optional().default("Organization"),
  industry: z.string().trim().max(200).optional().default(""),
  foundingDate: z.string().trim().max(20).optional().default(""),
  country: z.string().trim().max(2).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  streetAddress: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional().default(""),
  wikidataQid: z.string().trim().max(20).optional().default(""),
  sameAs: z.array(z.string().trim().max(500)).optional().default([]),
  aiVisibilityClaim: z.string().trim().max(300).optional().default(""),
  attribution: AttributionSchema,
});

type Input = z.infer<typeof RequestSchema>;

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function persistLead(input: Input): Promise<{ ok: boolean; error?: string }> {
  const sb = supabaseClient();
  if (!sb) return { ok: false, error: "supabase-not-configured" };

  const a = input.attribution || {};
  const { error: leadErr } = await sb.from("leads").insert({
    name: input.legalName || input.brandName,
    company: input.legalName || input.brandName,
    email: input.email,
    source: "schema-generator",
    status: "new",
    notes: [
      `industry=${input.industry || ""}`,
      `domain=${input.url || ""}`,
      `country=${input.country || ""}`,
      `wikidata_qid=${input.wikidataQid || ""}`,
    ].join("; "),
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
  });
  if (leadErr) return { ok: false, error: leadErr.message };

  // 同步 brands — 已存在（by name）就不重複。
  const { data: existing } = await sb
    .from("brands")
    .select("id")
    .eq("name", input.brandName)
    .maybeSingle();

  if (!existing) {
    const { error: brandErr } = await sb.from("brands").insert({
      name: input.brandName,
      domain: input.url || null,
      industry: input.industry || "default",
      market: input.country || "Taiwan",
      status: "prospect",
      primary_email: input.email,
    });
    if (brandErr) {
      // 不擋流程：lead 已存，brands 失敗只記 log。
      console.error("[api/schema] brands insert failed", brandErr);
    }
  } else {
    // 已存在的 brand：補上 primary_email 若尚未設，確保 queue 有地方寄信
    const { error: updErr } = await sb
      .from("brands")
      .update({ primary_email: input.email })
      .eq("id", existing.id)
      .is("primary_email", null);
    if (updErr) {
      console.error("[api/schema] brands primary_email backfill failed", updErr);
    }
  }
  return { ok: true };
}

function renderEmail(input: Input, jsonLdString: string, quickStatements: string) {
  const subject = `[Symcio] ${input.brandName} 的 Schema + Wikidata 已產出`;
  const html = `
    <div style="font-family:Inter,Noto Sans TC,sans-serif;max-width:640px;margin:0 auto;color:#0B0F19;">
      <p style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#6B7280;">
        Symcio · AI Visibility Intelligence
      </p>
      <h1 style="font-size:22px;margin-top:8px;">${escapeHtml(input.brandName)} 的結構化資料</h1>
      <p style="font-size:14px;color:#374151;">
        以下兩份檔案可以直接用：JSON-LD 貼進官網 &lt;head&gt;；QuickStatements 貼到
        <a href="https://quickstatements.toolforge.org" style="color:#0B0F19;">quickstatements.toolforge.org</a>（選 v1 格式）。
      </p>
      <h2 style="font-size:14px;margin-top:24px;">schema.org JSON-LD</h2>
      <pre style="background:#0B0F19;color:#fff;padding:16px;font-size:11px;line-height:1.6;overflow:auto;">${escapeHtml(jsonLdString)}</pre>
      <h2 style="font-size:14px;margin-top:24px;">Wikidata QuickStatements</h2>
      <pre style="background:#0B0F19;color:#fff;padding:16px;font-size:11px;line-height:1.6;overflow:auto;">${escapeHtml(quickStatements)}</pre>
      <p style="font-size:13px;margin-top:24px;color:#374151;">
        我們已把 <strong>${escapeHtml(input.brandName)}</strong> 加進 Symcio Free Scan 佇列，
        24 小時內會寄上四引擎（ChatGPT / Claude / Gemini / Perplexity）曝光快照。
      </p>
      <p style="font-size:13px;margin-top:16px;color:#374151;">
        想解鎖 20 個產業 prompt + 改善建議 PDF？
        <a href="https://symcio.tw/#pricing" style="color:#0B0F19;">升級 $299 AI Visibility Audit →</a>
      </p>
    </div>
  `;
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ApiResponse =
  | {
      ok: true;
      jsonLd: Record<string, unknown>;
      jsonLdString: string;
      quickStatements: string;
      warnings: string[];
      delivery: { supabase: boolean; notion: boolean; gmail: boolean };
    }
  | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  let parsed: Input;
  try {
    const json = await req.json();
    parsed = RequestSchema.parse(json);
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "Invalid request body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const output = generate({
    brandName: parsed.brandName,
    legalName: parsed.legalName,
    url: parsed.url,
    logoUrl: parsed.logoUrl,
    description: parsed.description,
    orgType: parsed.orgType as OrgType,
    industry: parsed.industry,
    foundingDate: parsed.foundingDate,
    country: parsed.country,
    city: parsed.city,
    streetAddress: parsed.streetAddress,
    email: parsed.email,
    phone: parsed.phone,
    wikidataQid: parsed.wikidataQid,
    sameAs: parsed.sameAs,
    aiVisibilityClaim: parsed.aiVisibilityClaim,
  });

  const sbResp = await persistLead(parsed);

  const notionResp = await saveLeadToNotion({
    brandName: parsed.brandName,
    email: parsed.email,
    company: parsed.legalName || parsed.brandName,
    industry: parsed.industry || "default",
    compositeScore: 0,
  });

  const { subject, html } = renderEmail(parsed, output.jsonLdString, output.quickStatements);
  const gmailResp = await sendGmail({ to: parsed.email, subject, bodyHtml: html });

  return NextResponse.json({
    ok: true,
    jsonLd: output.jsonLd,
    jsonLdString: output.jsonLdString,
    quickStatements: output.quickStatements,
    warnings: output.warnings,
    delivery: {
      supabase: sbResp.ok,
      notion: notionResp.ok,
      gmail: gmailResp.ok,
    },
  });
}
