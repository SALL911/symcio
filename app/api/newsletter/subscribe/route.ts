import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { subscribe } from "@/lib/newsletter/subscribers";
import { syncMember } from "@/lib/sync/member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 每週電子報訂閱端點（本人在網站表單送出 = 明確同意）。
// 1. newsletter_subscribers → active（週報 cron 的寄送名單）
// 2. leads（source=newsletter）保留給既有 lead-scorer / HubSpot workflow
// 3. HubSpot + Notion 同步（訂閱者不建立 Obsidian 會員筆記）
//
// Supabase 未設定時回 202（已收到），避免前端顯示失敗，server log 記錄以便補抓。

const BodySchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(120).optional(),
  source: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join(", ")
        : "bad body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const email = parsed.email.toLowerCase();
  const source = parsed.source || "website";
  const sb = adminClient();
  if (!sb) {
    console.warn("[newsletter] supabase not configured; email=%s", email);
    return NextResponse.json(
      { ok: true, message: "已收到訂閱,首期會寄到你的信箱。" },
      { status: 202 },
    );
  }

  const { error } = await subscribe(sb, { email, displayName: parsed.name, source });
  if (error) {
    console.error("[newsletter] subscribe failed", error);
    return NextResponse.json(
      { ok: false, error: "訂閱失敗,請稍後再試或來信 info@symcio.tw。" },
      { status: 500 },
    );
  }

  const { error: leadErr } = await sb.from("leads").insert({
    email,
    name: parsed.name || email,
    company: "",
    source: "newsletter",
    status: "subscribed",
    notes: "channel=symcio-weekly",
  });
  if (leadErr && !/duplicate|unique/i.test(leadErr.message)) {
    console.warn("[newsletter] leads insert failed", leadErr.message);
  }

  await syncMember(
    { email, name: parsed.name, source: "newsletter", newsletterOptIn: true, createdAt: new Date().toISOString() },
    ["hubspot", "notion"],
  );

  return NextResponse.json({
    ok: true,
    message: "已收到訂閱,下次發報會寄到你的信箱。",
  });
}
