#!/usr/bin/env node
// Symcio 品牌治理雙週刊 → HubSpot 電子報草稿（只建草稿，永不自動寄出）
//
// 用法：
//   node publish.mjs issues/2026-11-17.json        建立草稿
//   DRY_RUN=true node publish.mjs issues/x.json    只輸出預覽 HTML 到 .out/
//
// 環境變數：
//   HUBSPOT_TOKEN            私人應用程式 token（需要 content 與 marketing-email 權限）
//   HUBSPOT_PORTAL_ID        預設 244117180
//   HUBSPOT_SUBSCRIPTION_ID  （選填）「Symcio 品牌治理雙週刊」訂閱類型 ID
//   NEWSLETTER_FROM_NAME     （選填）寄件者名稱，預設「Symcio 全識」
//   NEWSLETTER_REPLY_TO      （選填）回覆信箱

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://api.hubapi.com";
const PORTAL = process.env.HUBSPOT_PORTAL_ID || "244117180";
const TOKEN = process.env.HUBSPOT_TOKEN;
const DRY = String(process.env.DRY_RUN).toLowerCase() === "true";
const TEMPLATE_DIR = "symcio-newsletter";

import { render, validate } from "./render.mjs";

async function hs(method, url, body, isForm = false) {
  const res = await fetch(API + url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(isForm ? {} : { "Content-Type": "application/json" }) },
    body: isForm ? body : body && JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HubSpot ${method} ${url} → ${res.status}\n${text.slice(0, 800)}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("請指定期數檔，例如 issues/2026-11-17.json");
  const issue = JSON.parse(await readFile(file, "utf8"));
  validate(issue);
  const html = render(issue);
  const slug = `issue-${issue.date}`;
  const name = `Symcio 品牌治理雙週刊 #${issue.issueNo}（${issue.date}）`;

  await mkdir(".out", { recursive: true });
  await writeFile(path.join(".out", `${slug}.html`), html);
  console.log(`預覽已輸出：.out/${slug}.html`);
  if (DRY) return console.log("DRY_RUN=true，未呼叫 HubSpot。");
  if (!TOKEN) throw new Error("缺少 HUBSPOT_TOKEN");

  // 避免重複：同名草稿已存在就跳過
  const existing = await hs("GET", `/marketing/v3/emails?limit=100&sort=-createdAt`);
  const dup = (existing.results || []).find((e) => e.name === name);
  if (dup) {
    console.log(`已存在同名電子報（id ${dup.id}），略過。`);
    console.log(`編輯：https://app.hubspot.com/email/${PORTAL}/edit/${dup.id}/content`);
    return;
  }

  // 1. 上傳這一期的編碼式範本
  const templatePath = `${TEMPLATE_DIR}/${slug}.html`;
  const form = new FormData();
  form.append("file", new Blob([html], { type: "text/html" }), `${slug}.html`);
  await hs("PUT", `/cms/v3/source-code/published/content/${encodeURI(templatePath)}`, form, true);
  console.log(`範本已上傳：${templatePath}`);

  // 2. 用範本建立電子報草稿（不寄出、不排程）
  const payload = { name, subject: issue.subject, templatePath };
  if (process.env.NEWSLETTER_FROM_NAME || process.env.NEWSLETTER_REPLY_TO) {
    payload.from = { fromName: process.env.NEWSLETTER_FROM_NAME || "Symcio 全識",
      ...(process.env.NEWSLETTER_REPLY_TO ? { replyTo: process.env.NEWSLETTER_REPLY_TO } : {}) };
  }
  if (process.env.HUBSPOT_SUBSCRIPTION_ID) {
    payload.subscriptionDetails = { subscriptionId: process.env.HUBSPOT_SUBSCRIPTION_ID };
  }
  const email = await hs("POST", "/marketing/v3/emails", payload);
  console.log(`草稿已建立（id ${email.id}）`);
  console.log(`編輯與寄送：https://app.hubspot.com/email/${PORTAL}/edit/${email.id}/content`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
