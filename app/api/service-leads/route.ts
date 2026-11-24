import { NextResponse } from "next/server";
import { z } from "zod";
import { captureLead } from "@/lib/leads/capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// /service「預約導入諮詢」表單。原本是 mailto 連結，無法追蹤也常被瀏覽器擋掉。
// 這裡把諮詢需求寫進 leads（source=service-form）並即時寄通知信。

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  company: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  need: z.string().trim().max(1000).optional().default(""),
  // 蜜罐欄位：真人看不到也不會填，有值就當機器人
  website_url: z.string().max(200).optional().default(""),
  attribution: z.record(z.string(), z.string().max(500)).optional().default({}),
  meta_event_id: z.string().trim().max(100).optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-body" }, { status: 400 });
  }
  // 機器人：回成功但不處理，避免對方調整策略
  if (parsed.website_url) return NextResponse.json({ ok: true });

  const result = await captureLead(req, {
    source: "service-form",
    name: parsed.name,
    company: parsed.company,
    email: parsed.email,
    notes: parsed.need ? `need=${parsed.need}` : "need=(未填)",
    attribution: parsed.attribution,
    metaEventId: parsed.meta_event_id,
    metaContentName: "service_consult",
    confirm: true,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "lead-not-captured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
