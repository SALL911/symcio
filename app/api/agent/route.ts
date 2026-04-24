import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { generateFakeReport } from "@/lib/agent/fake-data";
import { enrichSummary } from "@/lib/agent/summary";
import { renderReportEmail } from "@/lib/agent/email-template";
import { saveLeadToNotion, sendGmail } from "@/lib/agent/composio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  brand_name: z.string().trim().min(1).max(200),
  brand_domain: z.string().trim().max(500).optional().default(""),
  industry: z
    .enum(["technology", "finance", "consumer_goods", "default"])
    .optional()
    .default("technology"),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200).optional().default(""),
  attribution: AttributionSchema,
});

type ApiResponse =
  | {
      ok: true;
      report: ReturnType<typeof generateFakeReport>;
      delivery: {
        supabase: boolean;
        notion: boolean;
        gmail: boolean;
      };
      warnings: string[];
    }
  | { ok: false; error: string };

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function saveLeadToSupabase(
  input: z.infer<typeof RequestSchema>,
  compositeScore: number,
): Promise<{ ok: boolean; error?: string }> {
  const sb = supabaseClient();
  if (!sb) return { ok: false, error: "supabase-not-configured" };

  const a = input.attribution || {};
  const { error } = await sb.from("leads").insert({
    name: input.company || input.brand_name,
    company: input.company || input.brand_name,
    email: input.email,
    source: "landing-agent",
    status: "new",
    notes: [
      `industry=${input.industry}`,
      `domain=${input.brand_domain || ""}`,
      `composite_score=${compositeScore}`,
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
  return { ok: !error, error: error?.message };
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  let parsed: z.infer<typeof RequestSchema>;
  try {
    const json = await req.json();
    parsed = RequestSchema.parse(json);
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "Invalid request body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const warnings: string[] = [];

  // 1. Generate the (fake-data) visibility report.
  //    Real four-engine queries run in GitHub Actions via scripts/geo_audit.py
  //    for paying customers — not on this hot path.
  const baseReport = generateFakeReport(parsed.brand_name);

  // 2. Optionally enrich summary with Gemini (free tier).
  const summary = await enrichSummary(baseReport);
  const report = { ...baseReport, summary };

  // 3. Persist lead to Supabase (always, if configured).
  const sbResp = await saveLeadToSupabase(parsed, report.composite_score);
  if (!sbResp.ok) warnings.push(`supabase: ${sbResp.error}`);

  // 4. Persist lead to Notion via Composio (if configured).
  const notionResp = await saveLeadToNotion({
    brandName: parsed.brand_name,
    email: parsed.email,
    company: parsed.company,
    industry: parsed.industry,
    compositeScore: report.composite_score,
  });
  if (!notionResp.ok) warnings.push(`notion: ${notionResp.error}`);

  // 5. Send email via Composio Gmail (if configured).
  const { subject, html } = renderReportEmail(report);
  const gmailResp = await sendGmail({
    to: parsed.email,
    subject,
    bodyHtml: html,
  });
  if (!gmailResp.ok) warnings.push(`gmail: ${gmailResp.error}`);

  return NextResponse.json({
    ok: true,
    report,
    delivery: {
      supabase: sbResp.ok,
      notion: notionResp.ok,
      gmail: gmailResp.ok,
    },
    warnings,
  });
}
