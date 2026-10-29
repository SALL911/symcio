/**
 * 每日補同步 — 把 crm_synced_at 為空的會員重送 HubSpot / Notion / Obsidian。
 * 涵蓋：callback 當下外部 API 失敗、在 Supabase 後台手動建立的帳號、歷史會員回填。
 *
 * 保護：Authorization: Bearer $CRON_SECRET
 */

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { cronAuthorized } from "@/lib/cron/auth";
import { syncMember } from "@/lib/sync/member";
import { MEMBER_COLUMNS, toMemberRecord, type MemberRow } from "@/lib/sync/from-member-row";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const BATCH = 50;

export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = adminClient();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });

  const { data, error } = await sb
    .from("members")
    .select(MEMBER_COLUMNS)
    .is("crm_synced_at", null)
    .order("created_at")
    .limit(BATCH);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let ok = 0;
  let failed = 0;
  for (const row of (data as MemberRow[]) ?? []) {
    const rec = toMemberRecord(row);
    if (!rec) continue;
    const results = await syncMember(rec);
    if (results.some((r) => r.status === "failed")) failed++;
    else ok++;
  }
  return NextResponse.json({ ok: failed === 0, processed: data?.length ?? 0, synced: ok, failed });
}
