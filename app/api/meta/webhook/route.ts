import { NextResponse } from "next/server";
import { verifyMetaSignature, verifyHandshake, sendMessage } from "@/lib/meta/client";
import { replyForText } from "@/lib/marketing/reply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MetaEntry {
  messaging?: Array<{
    sender?: { id: string };
    message?: { text?: string; is_echo?: boolean };
  }>;
}

// Meta webhook verification handshake (Messenger / Instagram setup).
export async function GET(req: Request): Promise<Response> {
  const challenge = verifyHandshake(new URL(req.url).searchParams);
  if (challenge === null) {
    return NextResponse.json({ ok: false, error: "verify-failed" }, { status: 403 });
  }
  return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

// Incoming messages: verify signature, then auto-reply with the acquisition funnel.
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  if (!verifyMetaSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 403 });
  }

  let entries: MetaEntry[] = [];
  try {
    entries = (JSON.parse(rawBody).entry ?? []) as MetaEntry[];
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const jobs: Promise<unknown>[] = [];
  for (const entry of entries) {
    for (const m of entry.messaging ?? []) {
      if (m.message?.is_echo) continue;
      if (m.sender?.id && m.message?.text) {
        jobs.push(sendMessage(m.sender.id, replyForText(m.message.text)));
      }
    }
  }
  await Promise.all(jobs);

  return NextResponse.json({ ok: true });
}
