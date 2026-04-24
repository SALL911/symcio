import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

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
});

function supa() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "bad body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const sb = supa();
  if (!sb) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  }

  const a = parsed.attribution || {};
  const notes = [
    `company_size=${parsed.company_size}`,
    `revenue=${parsed.revenue}`,
    parsed.bci !== undefined ? `bci=${parsed.bci}` : "",
    parsed.tier ? `tier=${parsed.tier}` : "",
    parsed.website ? `website=${parsed.website}` : "",
  ].filter(Boolean).join("; ");

  const { error } = await sb.from("leads").insert({
    name: parsed.contact_name || parsed.brand_name_zh,
    company: parsed.brand_name_zh,
    email: parsed.email,
    source: "audit-form",
    status: "new",
    notes,
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
  if (error) {
    console.error("[api/audit-leads] insert failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // 若有 brand_name_zh 也同步 brands（status=prospect）— 後續 geo-audit-queue 會撿走
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

  return NextResponse.json({ ok: true });
}
