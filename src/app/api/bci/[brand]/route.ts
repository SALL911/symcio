import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public BCI endpoint — Brand Capital Index.
 *
 * By design, this route exposes ONLY `total_bci + updated_at + industry_key`.
 * Sub-scores (F/V/E), weight vectors, and raw_metrics are deliberately NOT
 * returned — they are IP core, consumed only by internal dashboards via the
 * service-role client with explicit column selection.
 *
 * Methodology: docs/BCI_METHODOLOGY.md
 * Engine:      scripts/bci_engine.py (daily cron)
 *
 * `[brand]` accepts either a brand UUID or a brand slug/name — slug lookup
 * first, falls back to UUID exact match.
 */

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(
  _req: Request,
  { params }: { params: { brand: string } },
): Promise<Response> {
  const sb = supabase();
  if (!sb) {
    return NextResponse.json(
      { ok: false, error: "bci-not-configured" },
      { status: 503 },
    );
  }

  const key = decodeURIComponent(params.brand).trim();
  if (!key) {
    return NextResponse.json({ ok: false, error: "missing-brand" }, { status: 400 });
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);

  const brandQuery = sb.from("brands").select("id,name,industry").limit(1);
  const { data: brandRow, error: brandErr } = await (
    isUuid ? brandQuery.eq("id", key) : brandQuery.ilike("name", key)
  ).maybeSingle();

  if (brandErr) {
    return NextResponse.json(
      { ok: false, error: "brand-lookup-failed" },
      { status: 500 },
    );
  }
  if (!brandRow) {
    return NextResponse.json({ ok: false, error: "brand-not-found" }, { status: 404 });
  }

  const { data: snap, error: snapErr } = await sb
    .from("bci_snapshots")
    .select("total_bci, industry_key, snapshot_date, created_at")
    .eq("brand_id", brandRow.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapErr) {
    return NextResponse.json(
      { ok: false, error: "snapshot-lookup-failed" },
      { status: 500 },
    );
  }
  if (!snap) {
    return NextResponse.json(
      { ok: false, error: "no-snapshot-yet", brand: brandRow.name },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      brand: brandRow.name,
      total_bci: snap.total_bci,
      industry_key: snap.industry_key,
      snapshot_date: snap.snapshot_date,
      updated_at: snap.created_at,
    },
    {
      headers: {
        // Public data, cache for 1h at edge
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
