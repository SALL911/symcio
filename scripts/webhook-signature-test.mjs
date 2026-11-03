#!/usr/bin/env node
// Verifies the LINE and Meta webhook signature schemes match what the platforms
// send, so a correctly-signed payload is accepted and a tampered one is rejected.
//
//   node scripts/webhook-signature-test.mjs

import crypto from "crypto";

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}: ${name}`);
  if (!cond) failures++;
};

// --- LINE: base64 HMAC-SHA256 of raw body with channel secret ---
function lineSign(body, secret) {
  return crypto.createHmac("sha256", secret).update(body).digest("base64");
}
function lineVerify(body, sig, secret) {
  if (!sig) return false;
  const a = Buffer.from(lineSign(body, secret));
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
{
  const secret = "line_test_secret";
  const body = JSON.stringify({ events: [{ type: "message", replyToken: "r", message: { type: "text", text: "hi" } }] });
  const sig = lineSign(body, secret);
  check("LINE valid signature accepted", lineVerify(body, sig, secret));
  check("LINE tampered body rejected", !lineVerify(body + "x", sig, secret));
  check("LINE missing signature rejected", !lineVerify(body, null, secret));
}

// --- Meta: "sha256=" + hex HMAC-SHA256 of raw body with app secret ---
function metaSign(body, secret) {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
}
function metaVerify(body, header, secret) {
  if (!header) return false;
  const a = Buffer.from(metaSign(body, secret));
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
{
  const secret = "meta_app_secret";
  const body = JSON.stringify({ entry: [{ messaging: [{ sender: { id: "1" }, message: { text: "hi" } }] }] });
  const sig = metaSign(body, secret);
  check("Meta valid signature accepted", metaVerify(body, sig, secret));
  check("Meta tampered body rejected", !metaVerify(body, metaSign(body + "x", secret), secret));
  check("Meta missing signature rejected", !metaVerify(body, null, secret));
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
