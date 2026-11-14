/**
 * Supabase auth callback（Google OAuth / Email 確認信 / 重設密碼連結）。
 *
 * 1. 以 code 換 session（寫入 cookie）
 * 2. 首次登入：補 members.signup_source / company_name（電子報訂閱一律走 /subscribe，不在此處理）
 * 3. 尚未同步過的會員 → HubSpot / Notion / Obsidian（失敗由每日 member-sync cron 重試）
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { syncMember } from "@/lib/sync/member";
import { MEMBER_COLUMNS, toMemberRecord, type MemberRow } from "@/lib/sync/from-member-row";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 只允許站內相對路徑，避免 open redirect。 */
function safeNext(v: string | null): string {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/member";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing-code`, request.url));
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      );
    }
    if (data.user) await onAuthenticated(data.user);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "callback-failed";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, request.url));
  }
}

interface AuthUser {
  id: string;
  email?: string;
  app_metadata?: { provider?: string };
  user_metadata?: Record<string, unknown>;
}

async function onAuthenticated(user: AuthUser) {
  const sb = adminClient();
  if (!sb || !user.email) return;

  try {
    const { data: row } = await sb
      .from("members")
      .select(`${MEMBER_COLUMNS}, crm_synced_at`)
      .eq("id", user.id)
      .maybeSingle();
    if (!row || (row as { crm_synced_at: string | null }).crm_synced_at) return;

    const meta = user.user_metadata ?? {};
    const patch = {
      signup_source: (row as MemberRow).signup_source || (user.app_metadata?.provider === "google" ? "google" : "signup"),
      company_name: (row as MemberRow).company_name || (typeof meta.company === "string" ? meta.company : null),
    };
    await sb.from("members").update(patch).eq("id", user.id);

    const rec = toMemberRecord({ ...(row as MemberRow), ...patch });
    if (rec) await syncMember(rec);
  } catch (err) {
    // 同步失敗不阻斷登入；member-sync cron 會補
    console.error("[auth/callback] post-login sync failed", err);
  }
}
