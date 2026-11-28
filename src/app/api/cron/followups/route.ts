import { NextResponse } from "next/server";
import { leadsSupabase } from "@/lib/leads/capture";
import { runDueFollowups } from "@/brandos/followup/schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 每日跟進信排程（vercel.json crons）。Vercel Cron 會帶 Authorization: Bearer $CRON_SECRET。
// 未設定 CRON_SECRET 時一律拒絕，避免任何人都能觸發寄信。
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = leadsSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  try {
    return NextResponse.json({ ok: true, ...(await runDueFollowups(sb)) });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
