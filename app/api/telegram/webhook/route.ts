import { NextResponse } from "next/server";
import { verifyTelegramSecret, sendMessage } from "@/lib/telegram/client";
import { replyForText } from "@/lib/marketing/reply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TelegramUpdate {
  message?: { chat?: { id: number }; text?: string };
}

// Telegram bot webhook. Optionally checks the secret-token header, then replies
// to any message with the acquisition funnel (free scan + ebook).
export async function POST(req: Request): Promise<Response> {
  if (!verifyTelegramSecret(req.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ ok: false, error: "invalid-secret" }, { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  if (chatId) {
    await sendMessage(chatId, replyForText(update.message?.text ?? ""));
  }

  return NextResponse.json({ ok: true });
}
