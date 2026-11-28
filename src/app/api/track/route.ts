import { NextResponse } from "next/server";
import { z } from "zod";
import { leadsSupabase } from "@/lib/leads/capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 站內瀏覽事件，供內部漏斗看板計算訪客數與轉化率。
// 只存路徑、分頁層級的隨機 session ID 與 utm_source；不存 IP、email 或 User-Agent。

const Body = z.object({
  event: z.enum(["page_view"]),
  path: z.string().max(255).startsWith("/"),
  session_id: z.string().regex(/^[a-z0-9-]{8,64}$/i),
  utm_source: z.string().max(255).optional(),
});

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|axios/i;

export async function POST(req: Request) {
  // 一律回 204：這是背景信標，不讓錯誤影響頁面，也不洩漏內部狀態
  const done = () => new NextResponse(null, { status: 204 });
  if (BOT.test(req.headers.get("user-agent") || "")) return done();
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(JSON.parse(await req.text()));
  } catch {
    return done();
  }
  const sb = leadsSupabase();
  if (!sb) return done();
  const { error } = await sb.from("funnel_events").insert({
    event: body.event,
    path: body.path.split("?")[0],
    session_id: body.session_id,
    utm_source: body.utm_source || null,
  });
  if (error) console.error("[track] insert failed", error.message);
  return done();
}
