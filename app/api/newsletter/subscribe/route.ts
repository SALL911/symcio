import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 每週電子報訂閱端點。
// 目前只把 email 寫進既有的 leads 表(source=newsletter),
// 等選定外部寄信平台(Resend / Beehiiv / Mailchimp)後,
// 在這裡 fan-out 同步到該平台的名單。
//
// Supabase 未設定時回 202(已收到),避免訂閱表單在前端顯示失敗,
// 但 server log 會記下,以便日後手動補抓。

const BodySchema = z.object({
  email: z.string().trim().email().max(254),
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
    const msg =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join(", ")
        : "bad body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const sb = supa();
  if (!sb) {
    console.warn("[newsletter] supabase not configured; email=%s", parsed.email);
    return NextResponse.json(
      { ok: true, message: "已收到訂閱,首期會寄到你的信箱。" },
      { status: 202 },
    );
  }

  const { error } = await sb.from("leads").insert({
    email: parsed.email,
    name: parsed.email,
    company: "",
    source: "newsletter",
    status: "subscribed",
    notes: "channel=symcio-weekly",
  });

  if (error && !/duplicate|unique/i.test(error.message)) {
    console.error("[newsletter] insert failed", error);
    return NextResponse.json(
      { ok: false, error: "訂閱失敗,請稍後再試或來信 info@symcio.tw。" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "已收到訂閱,下次發報會寄到你的信箱。",
  });
}
