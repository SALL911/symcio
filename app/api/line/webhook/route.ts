/**
 * LINE 官方帳號 webhook（Messaging API）。
 *
 * LINE Developers → Messaging API → Webhook URL：https://symcio.tw/api/line/webhook
 *
 * - follow：讀 profile → upsert line_followers → 回歡迎訊息 + 快速選單
 * - unfollow：標記 unfollowed_at
 * - message(text)：關鍵字自動回覆（lib/line/replies.ts）；「真人」類關鍵字標記 needs_human
 *
 * 一律 200 回應（LINE 對非 200 會重送並在後台標錯）；簽章不符回 401。
 */

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { getProfile, reply, verifySignature } from "@/lib/line/client";
import { replyFor, wantsHuman, welcome } from "@/lib/line/replies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { type: string; userId?: string };
  message?: { type: string; text?: string };
  timestamp: number;
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-line-signature"))) {
    return NextResponse.json({ ok: false, error: "bad-signature" }, { status: 401 });
  }

  let events: LineEvent[] = [];
  try {
    events = (JSON.parse(raw) as { events?: LineEvent[] }).events ?? [];
  } catch {
    return NextResponse.json({ ok: true });
  }

  const sb = adminClient();
  for (const ev of events) {
    const userId = ev.source?.type === "user" ? ev.source.userId : undefined;
    try {
      if (ev.type === "follow" && userId) {
        const profile = await getProfile(userId);
        await sb?.from("line_followers").upsert(
          {
            line_user_id: userId,
            display_name: profile?.displayName ?? null,
            picture_url: profile?.pictureUrl ?? null,
            language: profile?.language ?? null,
            followed_at: new Date(ev.timestamp).toISOString(),
            unfollowed_at: null,
          },
          { onConflict: "line_user_id" },
        );
        if (ev.replyToken) await reply(ev.replyToken, welcome(profile?.displayName));
      } else if (ev.type === "unfollow" && userId) {
        await sb
          ?.from("line_followers")
          .update({ unfollowed_at: new Date(ev.timestamp).toISOString() })
          .eq("line_user_id", userId);
      } else if (ev.type === "message" && ev.message?.type === "text" && ev.replyToken) {
        const input = ev.message.text ?? "";
        if (userId) {
          // upsert：webhook 啟用前就加好友的用戶，第一次傳訊時補建資料列
          await sb?.from("line_followers").upsert(
            {
              line_user_id: userId,
              last_message_at: new Date(ev.timestamp).toISOString(),
              last_message: input.slice(0, 500),
              ...(wantsHuman(input) ? { needs_human: true } : {}),
            },
            { onConflict: "line_user_id" },
          );
        }
        await reply(ev.replyToken, replyFor(input));
      }
    } catch (err) {
      console.error("[line] event failed", ev.type, err);
    }
  }
  return NextResponse.json({ ok: true });
}
