/**
 * RFC 8058 one-click 退訂：信箱服務商（Gmail / Apple Mail）以 POST 呼叫，不經使用者瀏覽器。
 * GET 導向退訂頁（使用者手動點開 header 連結時）。
 */

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { decodeEmail, verify } from "@/lib/newsletter/token";
import { unsubscribe } from "@/lib/newsletter/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const p = new URL(req.url).searchParams;
  const email = decodeEmail(p.get("e") ?? "");
  if (!email || !verify("unsubscribe", email, p.get("t") ?? "")) {
    return NextResponse.json({ ok: false, error: "invalid-token" }, { status: 400 });
  }
  const sb = adminClient();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  const { error } = await unsubscribe(sb, email);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  return NextResponse.redirect(new URL(`/newsletter/unsubscribe${u.search}`, u.origin));
}
