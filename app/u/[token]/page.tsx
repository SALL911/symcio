import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "取消訂閱 — Symcio SMS",
  robots: { index: false },
};

// 個資法 §20 第 3 項：一鍵退訂（讀 URL 即生效，不另要求填表）。
// 這是故意設計成 GET：SMS 裡直接點連結就完成退訂，UX 比 POST 多一步表單好。
// 代價：搜尋引擎爬蟲可能誤觸；以 robots noindex 減風險，token 16 bytes 隨機不可猜。

async function applyOptOut(token: string): Promise<{ ok: boolean; phone?: string; alreadyOptedOut?: boolean }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false };
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { data: sub } = await sb
    .from("sms_subscribers")
    .select("id, phone, opt_out_at")
    .eq("opt_out_token", token)
    .maybeSingle();
  if (!sub) return { ok: false };

  if (sub.opt_out_at) return { ok: true, phone: sub.phone, alreadyOptedOut: true };

  const { error } = await sb
    .from("sms_subscribers")
    .update({ opt_out_at: new Date().toISOString() })
    .eq("id", sub.id);
  if (error) return { ok: false };

  return { ok: true, phone: sub.phone };
}

function maskPhone(p?: string): string {
  if (!p) return "";
  return p.replace(/(\+886)(\d{3})(\d{3})(\d+)/, "$1 $2 *** $4").replace(/(\d{4})(\d+)/, "$1****");
}

export default async function OptOutPage({ params }: { params: { token: string } }) {
  const result = await applyOptOut(params.token);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-xl px-6 py-20">
        {result.ok ? (
          <>
            <h1 className="text-2xl font-semibold">
              {result.alreadyOptedOut ? "你已經退訂過了" : "已退訂 ✓"}
            </h1>
            <p className="mt-4 text-sm text-muted">
              {maskPhone(result.phone)} 不會再收到 Symcio 的行銷簡訊。
              {!result.alreadyOptedOut && " 此動作即時生效，未來若想重新訂閱請來信 support@symcio.tw。"}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">退訂連結無效</h1>
            <p className="mt-4 text-sm text-muted">
              找不到對應的訂閱紀錄。若你仍收到 Symcio 簡訊，請來信 support@symcio.tw，
              我們會手動處理。
            </p>
          </>
        )}
      </div>
    </main>
  );
}
