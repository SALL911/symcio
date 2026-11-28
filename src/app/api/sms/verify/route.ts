import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// /api/sms/subscribe 發的 OTP 必須來這裡驗證。驗過才寫入 consent_at，
// 之後 campaign 才會把該 phone 納入發送名單。

const BodySchema = z.object({
  phone: z.string().trim().min(8).max(20),
  code: z.string().trim().regex(/^\d{4,8}$/),
});

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  if (digits.startsWith("886")) return `+${digits}`;
  if (digits.startsWith("09") && digits.length === 10) return `+886${digits.slice(1)}`;
  if (digits.startsWith("+")) return raw;
  return `+${digits}`;
}

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
  const phone = normalizePhone(parsed.phone);

  const sb = supa();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 500 });

  const { data: sub } = await sb
    .from("sms_subscribers")
    .select("id, verification_code, verification_expires_at, consent_at, opt_out_token")
    .eq("phone", phone)
    .maybeSingle();
  if (!sub) {
    return NextResponse.json({ ok: false, error: "找不到該門號的訂閱紀錄" }, { status: 404 });
  }
  if (!sub.verification_code || sub.verification_code !== parsed.code) {
    return NextResponse.json({ ok: false, error: "驗證碼不正確" }, { status: 401 });
  }
  if (sub.verification_expires_at && new Date(sub.verification_expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "驗證碼已過期，請重新申請" }, { status: 401 });
  }

  const { error } = await sb
    .from("sms_subscribers")
    .update({
      consent_at: new Date().toISOString(),
      verification_code: null,
      verification_expires_at: null,
    })
    .eq("id", sub.id);
  if (error) {
    console.error("[sms/verify] supabase update failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    optOutUrl: `https://symcio.tw/u/${sub.opt_out_token}`,
  });
}
