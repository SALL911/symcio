import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail, configuredProviders } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/send-email
 *
 * One HTTPS endpoint that any AI tool / automation (ChatGPT custom GPT Actions,
 * Manus, Make/Zapier/n8n, or plain curl) can call to send mail AS a real
 * @symcio.tw mailbox. The message lands in that mailbox's server-side Sent
 * folder so it stays in sync across every device.
 *
 * Provider is chosen automatically (or via the optional `provider` field):
 *   - "graph" → Microsoft 365 (info@symcio.tw lives here; saves to Outlook Sent)
 *   - "gmail" → Google Workspace / Gmail (saves to Gmail Sent)
 *
 * Security: this endpoint can send as your domain, so it is NOT open.
 *   - Caller must present `x-api-key: <SEND_EMAIL_API_KEY>`.
 *   - `from` must be one of SEND_EMAIL_ALLOWED_SENDERS (anti-spoofing).
 *
 * The OpenAPI schema for AI-tool import lives at /openapi/send-email.json.
 */

const AddrList = z.union([z.string().trim().min(3).max(254), z.array(z.string().trim().email()).max(50)]);

const BodySchema = z
  .object({
    from: z.string().trim().min(3).max(320), // may carry a display name
    to: AddrList,
    subject: z.string().trim().min(1).max(998),
    html: z.string().max(500_000).optional(),
    text: z.string().max(500_000).optional(),
    cc: AddrList.optional(),
    bcc: AddrList.optional(),
    replyTo: z.string().trim().email().max(254).optional(),
    provider: z.enum(["graph", "gmail"]).optional(),
  })
  .refine((b) => Boolean(b.html || b.text), { message: "either html or text is required" });

function extractEmail(addr: string): string {
  const m = addr.match(/<([^>]+)>/);
  return (m ? m[1] : addr).trim().toLowerCase();
}

/** Allowed sender mailboxes — defaults to the two symcio.tw addresses. */
function allowedSenders(): string[] {
  return (process.env.SEND_EMAIL_ALLOWED_SENDERS || "info@symcio.tw,sall@symcio.tw")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  // 1. Auth gate — without this, anyone could send mail as your domain.
  const expected = process.env.SEND_EMAIL_API_KEY;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "send-email-not-configured" }, { status: 503 });
  }
  if (req.headers.get("x-api-key") !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // 2. Validate body.
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "bad body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // 3. Anti-spoofing — only allow approved sender mailboxes.
  if (!allowedSenders().includes(extractEmail(body.from))) {
    return NextResponse.json(
      { ok: false, error: `sender not allowed; permitted: ${allowedSenders().join(", ")}` },
      { status: 403 },
    );
  }

  if (configuredProviders().length === 0) {
    return NextResponse.json({ ok: false, error: "no-email-provider-configured" }, { status: 503 });
  }

  // 4. Send via the right provider (saves to that mailbox's Sent folder).
  const result = await sendMail(body);
  if (!result.ok) {
    console.error("[api/send-email] send failed", result.error);
    return NextResponse.json({ ok: false, error: result.error, provider: result.provider }, { status: 502 });
  }
  return NextResponse.json({ ok: true, provider: result.provider, id: result.id });
}

/** GET → tiny health probe so you can confirm config without sending. */
export async function GET() {
  const providers = configuredProviders();
  return NextResponse.json({
    ok: true,
    service: "send-email",
    configured: providers.length > 0 && Boolean(process.env.SEND_EMAIL_API_KEY),
    providers,
    allowedSenders: allowedSenders(),
  });
}
