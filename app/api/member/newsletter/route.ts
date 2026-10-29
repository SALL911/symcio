import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { subscribe, unsubscribe } from "@/lib/newsletter/subscribers";
import { syncMember } from "@/lib/sync/member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ subscribed: z.boolean() });

/** 會員中心切換電子報訂閱。需登入；以 session 的 email 為準，不接受前端傳入 email。 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad body" }, { status: 400 });

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user?.email) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const sb = adminClient();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });

  const { error } = parsed.data.subscribed
    ? await subscribe(sb, { email: user.email, source: "member-center" })
    : await unsubscribe(sb, user.email);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const { data: m } = await sb
    .from("members")
    .update({ newsletter_opt_in: parsed.data.subscribed })
    .eq("id", user.id)
    .select("display_name, company_name, plan, signup_source, created_at")
    .maybeSingle();

  await syncMember(
    {
      email: user.email,
      name: m?.display_name,
      company: m?.company_name,
      plan: m?.plan,
      source: m?.signup_source || "signup",
      newsletterOptIn: parsed.data.subscribed,
      supabaseId: user.id,
      createdAt: m?.created_at || new Date().toISOString(),
    },
    ["hubspot", "notion"],
  );

  return NextResponse.json({ ok: true, subscribed: parsed.data.subscribed });
}
