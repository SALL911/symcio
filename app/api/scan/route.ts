import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Attribution {
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
}

interface ScanPayload {
  brand_name?: string;
  brand_domain?: string;
  industry?: string;
  email?: string;
  company?: string;
  attribution?: Attribution;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  let body: ScanPayload;
  try {
    body = (await req.json()) as ScanPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const brand_name = (body.brand_name || "").trim();
  const email = (body.email || "").trim();
  if (!brand_name || !email) {
    return NextResponse.json(
      { ok: false, error: "brand_name and email are required" },
      { status: 400 },
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    // Supabase 尚未設定 → 至少回 200 讓前端不死，伺服器 log 提醒
    console.warn("[scan] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set; skipping insert");
    return NextResponse.json({ ok: true, queued: false, reason: "supabase-not-configured" });
  }

  const a = body.attribution || {};

  // 寫 leads（總是寫，當作 CRM 入口）
  const { error: leadErr } = await supabase.from("leads").insert({
    name: body.company || brand_name,
    company: body.company || brand_name,
    email,
    source: "landing-free-scan",
    status: "new",
    notes: `industry=${body.industry || "technology"}; domain=${body.brand_domain || ""}`,
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
  if (leadErr) {
    console.error("[scan] leads insert failed", leadErr);
    return NextResponse.json({ ok: false, error: leadErr.message }, { status: 500 });
  }

  // 寫 brands（若已存在 by name+domain 則略過 — 簡單版）
  const { data: existing } = await supabase
    .from("brands")
    .select("id")
    .eq("name", brand_name)
    .maybeSingle();

  if (!existing) {
    const { error: brandErr } = await supabase.from("brands").insert({
      name: brand_name,
      domain: body.brand_domain || null,
      industry: body.industry || "technology",
      market: "Taiwan",
      status: "prospect",
      primary_email: email,
    });
    if (brandErr) {
      console.error("[scan] brands insert failed", brandErr);
      // 不擋流程，lead 已記錄
    }
  }

  // 觸發 GitHub Actions geo-audit workflow（若有 GITHUB_TOKEN）
  // 詳細實作留待下一階段：透過 repository_dispatch event 觸發
  // 目前 MVP 先回 queued=true，由人工每日跑 workflow_dispatch

  return NextResponse.json({ ok: true, queued: true });
}
