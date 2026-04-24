import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { mitakeCredentialsFromEnv, mitakeSend } from "@/lib/sms/mitake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 個資法 §20：收集行銷用電話號碼前必須明確告知用途並取得同意。
// 本 endpoint 只做第一步：收 phone + 送 OTP。使用者要在 /api/sms/verify 輸入
// OTP 才算真的 opt-in（consent_at 才會被寫入）。

const BodySchema = z.object({
  phone: z.string().trim().min(8).max(20),
  brand_id: z.string().uuid().optional(),
  consent_source: z.string().trim().max(50).default("landing"),
  segment_tags: z.array(z.string().max(50)).optional().default([]),
});

function normalizePhone(raw: string): string {
  // 台灣手機常見格式轉成 E.164：09xxxxxxxx → +8869xxxxxxxx
  const digits = raw.replace(/\D+/g, "");
  if (digits.startsWith("886")) return `+${digits}`;
  if (digits.startsWith("09") && digits.length === 10) return `+886${digits.slice(1)}`;
  if (digits.startsWith("+")) return raw;
  return digits.length >= 8 ? `+${digits}` : raw;
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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";

  const sb = supa();
  if (!sb) return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 500 });

  // 產 6 位 OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // upsert by phone：若已存在且已 opt_out，拒絕；否則更新 OTP
  const { data: existing } = await sb
    .from("sms_subscribers")
    .select("id, opt_out_at, consent_at")
    .eq("phone", phone)
    .maybeSingle();

  if (existing?.opt_out_at) {
    return NextResponse.json(
      { ok: false, error: "此門號已退訂，無法再次訂閱。請聯絡 support@symcio.tw" },
      { status: 403 },
    );
  }

  if (existing) {
    await sb
      .from("sms_subscribers")
      .update({
        verification_code: otp,
        verification_expires_at: expiresAt,
        consent_source: parsed.consent_source,
        consent_ip: ip,
        segment_tags: parsed.segment_tags,
        brand_id: parsed.brand_id ?? null,
      })
      .eq("id", existing.id);
  } else {
    await sb.from("sms_subscribers").insert({
      phone,
      brand_id: parsed.brand_id ?? null,
      consent_source: parsed.consent_source,
      consent_ip: ip,
      verification_code: otp,
      verification_expires_at: expiresAt,
      segment_tags: parsed.segment_tags,
    });
  }

  // 發 OTP SMS
  const creds = mitakeCredentialsFromEnv();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "MITAKE_USERNAME / MITAKE_PASSWORD 未設，SMS 無法發送" },
      { status: 500 },
    );
  }
  const result = await mitakeSend(creds, {
    phone,
    body: `[Symcio] 您的驗證碼：${otp}（10 分鐘內有效）。若非本人申請請忽略。`,
  });
  if (!result.ok) {
    console.error("[sms/subscribe] mitake send failed", result);
    return NextResponse.json(
      { ok: false, error: `SMS 發送失敗：${result.errorMessage}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, phone, providerMsgId: result.providerMsgId });
}
