#!/usr/bin/env node
/**
 * General-purpose CLI sender for @symcio.tw mail via the /api/send-email endpoint.
 *
 * This is the concrete hook for AI tools that can run shell commands
 * (Claude Code, Manus, cron jobs, CI): they call this to send as your domain,
 * and the copy is saved to the mailbox's Sent folder (synced across devices).
 *
 * Env:
 *   SEND_EMAIL_API_KEY  (required)  — the endpoint's x-api-key
 *   BASE_URL            (default https://symcio.tw)
 *
 * Usage:
 *   node scripts/send-email.mjs \
 *     --from "info@symcio.tw" --to "a@b.com,c@d.com" \
 *     --subject "Hi" --html "<p>body</p>"
 *
 * Flags: --from --to --subject --html --text --cc --bcc --reply-to --provider
 * (--to/--cc/--bcc accept comma-separated lists.) Reads --html/--text from a
 * file with @path, e.g. --html @./body.html. Add --json for machine-readable output.
 */

const BASE_URL = (process.env.BASE_URL || "https://symcio.tw").replace(/\/$/, "");
const API_KEY = process.env.SEND_EMAIL_API_KEY;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    if (key === "json") { out.json = true; continue; }
    const val = argv[++i];
    out[key] = val;
  }
  return out;
}

async function maybeFile(v) {
  if (typeof v === "string" && v.startsWith("@")) {
    const { readFile } = await import("node:fs/promises");
    return readFile(v.slice(1), "utf-8");
  }
  return v;
}

const args = parseArgs(process.argv.slice(2));
const asJson = Boolean(args.json);

function fail(msg) {
  if (asJson) console.log(JSON.stringify({ ok: false, error: msg }));
  else console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!API_KEY) fail("SEND_EMAIL_API_KEY env is required");
if (!args.from) fail("--from is required");
if (!args.to) fail("--to is required");
if (!args.subject) fail("--subject is required");
if (!args.html && !args.text) fail("one of --html or --text is required");

const list = (v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined);

const payload = {
  from: args.from,
  to: list(args.to),
  subject: args.subject,
  html: await maybeFile(args.html),
  text: await maybeFile(args.text),
  cc: list(args.cc),
  bcc: list(args.bcc),
  replyTo: args["reply-to"],
  provider: args.provider,
};
// drop undefined keys
for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];

const resp = await fetch(`${BASE_URL}/api/send-email`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  body: JSON.stringify(payload),
}).catch((e) => fail(`request failed: ${e.message}`));

const result = await resp.json().catch(() => ({}));
if (!resp.ok || !result.ok) fail(`send failed (HTTP ${resp.status}): ${JSON.stringify(result)}`);

if (asJson) console.log(JSON.stringify(result));
else console.log(`✅ Sent via "${result.provider}"${result.id ? ` (id=${result.id})` : ""} — saved to ${args.from}'s Sent folder.`);
