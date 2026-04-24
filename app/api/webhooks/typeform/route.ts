import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { fireRepositoryDispatch } from "@/lib/github/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Typeform webhook handler — Free Scan entry point.
 *
 * Pipeline:
 *   User submits Typeform (form ZZYlfK7A)
 *     → Typeform POSTs here with form_response payload
 *     → verify HMAC-SHA256 signature (Typeform-Signature header)
 *     → extract brand_name / email / industry from answers
 *     → INSERT into Supabase `leads` (= the queue)
 *     → fire GitHub repository_dispatch 'free-scan-request'
 *         (geo-audit.yml picks it up and runs the four-engine audit)
 *     → Notion sync happens via the existing Composio hubspot-sync.yml
 *       cron (or the /api/agent path for instant sync)
 *
 * Signature verification reference:
 *   https://www.typeform.com/developers/webhooks/secure-your-webhooks/
 *
 * Setup (manual, one-time):
 *   1. Typeform admin → Workspace → Connect → Webhooks
 *   2. Endpoint URL: https://symcio.tw/api/webhooks/typeform
 *   3. Secret: generate random 32-char string, set as TYPEFORM_WEBHOOK_SECRET
 *   4. Save — Typeform sends test payload immediately
 */

interface TypeformAnswer {
  field: { id: string; ref?: string; type: string; title?: string };
  type: string;
  text?: string;
  email?: string;
  number?: number;
  boolean?: boolean;
  choice?: { label: string };
  choices?: { labels: string[] };
  url?: string;
}

interface TypeformFormResponse {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    token: string;
    submitted_at: string;
    definition?: { fields?: Array<{ id: string; ref?: string; title: string }> };
    answers: TypeformAnswer[];
    hidden?: Record<string, string>;
  };
}

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  // Typeform signature format: "sha256=<base64>"
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");
  const received = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(received),
    );
  } catch {
    return false;
  }
}

/**
 * Map Typeform answers → structured lead fields.
 *
 * Matches by field ref (preferred, set in Typeform editor) or by title
 * substring fallback. The refs should be: brand_name / brand_domain / email /
 * industry / company. If you change the Typeform, update refs here.
 */
function extractFields(answers: TypeformAnswer[]): {
  brand_name?: string;
  brand_domain?: string;
  email?: string;
  industry?: string;
  company?: string;
} {
  const result: ReturnType<typeof extractFields> = {};

  for (const a of answers) {
    const ref = a.field.ref?.toLowerCase() ?? "";
    const title = a.field.title?.toLowerCase() ?? "";
    const value =
      a.email ?? a.text ?? a.choice?.label ?? a.url ??
      (typeof a.number === "number" ? String(a.number) : undefined);

    if (!value) continue;

    if (ref === "email" || title.includes("email") || a.type === "email") {
      result.email = value;
    } else if (ref === "brand_name" || title.includes("brand") || title.includes("品牌名")) {
      result.brand_name = value;
    } else if (ref === "brand_domain" || title.includes("domain") || title.includes("網域")) {
      result.brand_domain = value;
    } else if (ref === "industry" || title.includes("industry") || title.includes("產業")) {
      result.industry = value;
    } else if (ref === "company" || title.includes("company") || title.includes("公司")) {
      result.company = value;
    }
  }

  return result;
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "typeform-webhook-not-configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("typeform-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "missing-signature" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { ok: false, error: "invalid-signature" },
      { status: 401 },
    );
  }

  let payload: TypeformFormResponse;
  try {
    payload = JSON.parse(rawBody) as TypeformFormResponse;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid-json" },
      { status: 400 },
    );
  }

  if (payload.event_type !== "form_response") {
    // Acknowledge unknown events so Typeform stops retrying
    return NextResponse.json({ ok: true, handled: false, event: payload.event_type });
  }

  const fields = extractFields(payload.form_response.answers || []);
  const warnings: string[] = [];

  if (!fields.email) {
    return NextResponse.json(
      { ok: false, error: "no-email-in-submission" },
      { status: 400 },
    );
  }

  // 1. Supabase queue: insert lead row (= the "queue" in the pipeline).
  const sb = supabaseAdmin();
  let leadId: string | null = null;

  if (sb) {
    const { data, error } = await sb
      .from("leads")
      .insert({
        name: fields.company || fields.brand_name || fields.email,
        company: fields.company || fields.brand_name || null,
        email: fields.email,
        source: "typeform-ZZYlfK7A",
        status: "new",
        notes: [
          `typeform_token=${payload.form_response.token}`,
          `brand_name=${fields.brand_name || ""}`,
          `brand_domain=${fields.brand_domain || ""}`,
          `industry=${fields.industry || "technology"}`,
          `submitted_at=${payload.form_response.submitted_at}`,
        ].join("; "),
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[typeform-webhook] supabase insert failed", error);
      warnings.push(`supabase: ${error.message}`);
    } else {
      leadId = data?.id ?? null;
    }
  } else {
    warnings.push("supabase-not-configured");
  }

  // 2. GitHub dispatch → triggers geo-audit.yml to run AI audit for this lead.
  const dispatchResp = await fireRepositoryDispatch({
    eventType: "free-scan-request",
    clientPayload: {
      brand_name: fields.brand_name || "Unknown",
      brand_domain: fields.brand_domain || "",
      brand_industry: fields.industry || "technology",
      customer_email: fields.email,
      lead_id: leadId,
      typeform_token: payload.form_response.token,
      source: "typeform",
    },
  });
  if (!dispatchResp.ok) warnings.push(`dispatch: ${dispatchResp.error}`);

  // Note: Email sending + Notion sync happen downstream:
  //   - geo-audit.yml produces the report → commits to repo OR uploads to Supabase
  //   - a follow-up workflow reads visibility_results → Resend email to customer
  //   - composio-hubspot-sync.yml reads new `leads` rows and syncs to Notion/HubSpot

  return NextResponse.json({
    ok: true,
    event: "form_response",
    lead_id: leadId,
    warnings,
  });
}
