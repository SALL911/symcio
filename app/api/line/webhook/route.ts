import { NextResponse } from "next/server";
import { verifyLineSignature, replyText } from "@/lib/line/client";
import { replyForText, welcomeText } from "@/lib/marketing/reply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LineEvent {
  type: string;
  replyToken?: string;
  message?: { type: string; text?: string };
}

// LINE Messaging API webhook. Verifies the x-line-signature HMAC, then auto-replies
// to follows and text messages with the acquisition funnel (free scan + ebook).
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 403 });
  }

  let events: LineEvent[] = [];
  try {
    events = (JSON.parse(rawBody).events ?? []) as LineEvent[];
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  await Promise.all(
    events.map((e) => {
      if (!e.replyToken) return Promise.resolve();
      if (e.type === "follow") return replyText(e.replyToken, welcomeText());
      if (e.type === "message" && e.message?.type === "text") {
        return replyText(e.replyToken, replyForText(e.message.text ?? ""));
      }
      return Promise.resolve();
    }),
  );

  return NextResponse.json({ ok: true });
}
