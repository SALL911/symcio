import { NextResponse } from "next/server";
import { z } from "zod";
import { captureLead, leadsSupabase } from "@/lib/leads/capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// AuditForm 原本純前端算 BCI 不送任何 API → lead 漏光。
// 這個 endpoint 只做一件事：把 lead + UTM + BCI 結果 silent 寫到 leads 表。
// 前端 fire-and-forget，不影響使用者看報告的流程。

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

const BodySchema = z.object({
  brand_name_zh: z.string().trim().min(1).max(200),
  brand_name_en: z.string().trim().max(200).optional().default(""),
  website: z.string().trim().max(500).optional().default(""),
  industry: z.string().trim().max(100).optional().default(""),
  company_size: z.string().trim().max(50).optional().default(""),
  revenue: z.string().trim().max(50).optional().default(""),
  email: z.string().trim().email().max(254),
  contact_name: z.string().trim().max(100).optional().default(""),
  title: z.string().trim().max(100).optional().default(""),
  bci: z.number().min(0).max(100).optional(),
  tier: z.string().trim().max(30).optional().default(""),
  attribution: AttributionSchema,
  meta_event_id: z.string().trim().max(100).optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "bad body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const a = parsed.attribution || {};
  const notes = [
    `company_size=${parsed.company_size}`,
    `revenue=${parsed.revenue}`,
    parsed.industry ? `industry=${parsed.industry}` : "",
    parsed.title ? `title=${parsed.title}` : "",
    parsed.bci !== undefined ? `bci=${parsed.bci}` : "",
    parsed.tier ? `tier=${parsed.tier}` : "",
    parsed.website ? `website=${parsed.website}` : "",
  ].filter(Boolean).join("; ");

  // Supabase + 通知信 + Meta CAPI。Supabase 沒設定時名單仍會進信箱，不再整筆遺失。
  const result = await captureLead(req, {
    source: "audit-form",
    name: parsed.contact_name || parsed.brand_name_zh,
    company: parsed.brand_name_zh,
    email: parsed.email,
    notes,
    attribution: a,
    metaEventId: parsed.meta_event_id,
    metaContentName: "ai_visibility_audit",
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || "lead-not-captured" }, { status: 503 });
  }

  const sb = result.stored ? leadsSupabase() : null;
  // 若有 brand_name_zh 也同步 brands（status=prospect）— 後續 geo-audit-queue 會撿走
  if (sb) {
    const { data: existing } = await sb
      .from("brands")
      .select("id")
      .eq("name", parsed.brand_name_zh)
      .maybeSingle();
    if (!existing) {
      await sb.from("brands").insert({
        name: parsed.brand_name_zh,
        name_en: parsed.brand_name_en || null,
        domain: parsed.website || null,
        industry: parsed.industry || "default",
        market: "Taiwan",
        status: "prospect",
        primary_email: parsed.email,
      });
    }
  }

  return NextResponse.json({ ok: true, stored: result.stored, notified: result.notified });
}
