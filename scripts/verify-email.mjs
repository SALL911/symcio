#!/usr/bin/env node
/**
 * Verify the /api/send-email endpoint end-to-end:
 *   1. GET  health probe  → confirms a provider + API key are configured
 *   2. POST a real test mail → confirms sending works and (with Graph/Gmail)
 *      that the copy is saved to the sender mailbox's Sent folder.
 *
 * Usage:
 *   SEND_EMAIL_API_KEY=... BASE_URL=https://symcio.tw TEST_TO=you@example.com \
 *     node scripts/verify-email.mjs
 *
 * Optional: TEST_FROM (default info@symcio.tw), PROVIDER (graph|gmail).
 */

const BASE_URL = process.env.BASE_URL || "https://symcio.tw";
const API_KEY = process.env.SEND_EMAIL_API_KEY;
const TEST_TO = process.env.TEST_TO;
const TEST_FROM = process.env.TEST_FROM || "info@symcio.tw";
const PROVIDER = process.env.PROVIDER; // optional

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!API_KEY) die("SEND_EMAIL_API_KEY env is required");
if (!TEST_TO) die("TEST_TO env is required (where to send the test mail)");

const endpoint = `${BASE_URL.replace(/\/$/, "")}/api/send-email`;

console.log(`▶ Health check: GET ${endpoint}`);
const health = await fetch(endpoint).then((r) => r.json()).catch((e) => die(`health request failed: ${e.message}`));
console.log("  ", JSON.stringify(health));
if (!health.configured) die("endpoint reports configured:false — set env vars and redeploy first");

console.log(`▶ Sending test mail: ${TEST_FROM} → ${TEST_TO}`);
const resp = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  body: JSON.stringify({
    from: TEST_FROM,
    to: TEST_TO,
    subject: "send-email 驗證測試",
    html: "<p>這封是 verify-email.mjs 寄出的測試信。請到寄件人信箱的「寄件備份 / Sent」確認它在，並在你各裝置上確認同步。</p>",
    ...(PROVIDER ? { provider: PROVIDER } : {}),
  }),
});
const result = await resp.json().catch(() => ({}));
if (!resp.ok || !result.ok) die(`send failed (HTTP ${resp.status}): ${JSON.stringify(result)}`);

console.log(`✅ Sent via provider="${result.provider}". ${result.id ? `id=${result.id}` : ""}`);
console.log(`   Now open ${TEST_FROM}'s Sent folder on phone + desktop — the same message should appear on both.`);
