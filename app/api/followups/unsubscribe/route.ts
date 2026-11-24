import { leadsSupabase } from "@/lib/leads/capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200): Response {
  return new Response(
    `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} — Symcio</title></head>
<body style="font-family:-apple-system,Segoe UI,Noto Sans TC,sans-serif;background:#F7F6F3;color:#1A2E22;padding:64px 24px;text-align:center;">
<h1 style="font-size:22px;">${title}</h1><p style="color:#6B7B6F;">${body}</p><p><a href="/" style="color:#2A4D3A;">回到 symcio.tw</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

// 跟進信的取消訂閱連結。token 是每筆名單的隨機 UUID，不需登入。
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t") || "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) return page("連結無效", "這個取消訂閱連結格式不正確。", 400);

  const sb = leadsSupabase();
  if (!sb) return page("暫時無法處理", "請直接來信 info@symcio.tw，我們會為你取消。", 503);

  const { data, error } = await sb
    .from("leads")
    .update({ followup_opt_out: true })
    .eq("unsubscribe_token", token)
    .select("id");
  if (error) return page("暫時無法處理", "請直接來信 info@symcio.tw，我們會為你取消。", 500);

  // 把尚未寄出的排程一併取消
  const ids = (data || []).map((r) => r.id as string);
  if (ids.length > 0) {
    await sb.from("lead_followups").update({ status: "skipped" }).in("lead_id", ids).eq("status", "pending");
  }
  // 不論是否找到名單都回同一個結果，避免被用來探測 token
  return page("已取消訂閱", "你不會再收到後續的跟進信。");
}
