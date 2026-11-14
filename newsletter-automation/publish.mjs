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

const C = { page: "#EDEAE0", card: "#FFFFFF", ink: "#1C2A22", body: "#3A443C", muted: "#5E6359",
  foot: "#7A7F73", line: "#D9D4C6", soft: "#F5F3EC", green: "#1F3D2C", gold: "#9C7A42",
  goldSoft: "#C9A86A", onGreen: "#EEE8D8", onGreenBody: "#D8D2C2" };
const SANS = "'PingFang TC','Microsoft JhengHei','Noto Sans TC',Arial,sans-serif";
const SERIF = "'Songti TC','Noto Serif TC','PMingLiU',serif";
const MONO = "'Courier New',monospace";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/\{\{|\}\}|\{%|%\}/g, (m) => m.split("").join("&#8203;"));
const rich = (s = "") => esc(s).replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.green};">$1</strong>`).replace(/\n/g, "<br>");
const label = (t) => `<div style="font-family:${MONO};font-size:11px;letter-spacing:2px;color:${C.gold};">${esc(t)}</div>`;

function validate(i) {
  const need = ["date", "issueNo", "subject", "headline", "intro", "sections", "cta"];
  const miss = need.filter((k) => i[k] === undefined || i[k] === "");
  if (miss.length) throw new Error(`期數檔缺少欄位：${miss.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.date)) throw new Error("date 格式要是 YYYY-MM-DD");
  if (!/^https:\/\//.test(i.cta.url || "")) throw new Error("cta.url 要是 https 開頭的網址");
}

function render(i) {
  const [y, m] = i.date.split("-");
  const sections = i.sections.map((s) => `
  <tr><td style="padding:20px 32px 6px 32px;font-family:${SANS};">
    ${label(s.label)}
    <h2 style="margin:6px 0 8px 0;font-size:19px;color:${C.ink};">${esc(s.title)}</h2>
    <p style="margin:0;font-size:15px;line-height:1.8;color:${C.body};">${rich(s.body)}</p>
  </td></tr>`).join("");

  const action = i.action ? `
  <tr><td style="padding:20px 32px 24px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.line};">
      <tr><td style="padding:20px 22px;font-family:${SANS};">
        ${label(i.action.label)}
        <p style="margin:8px 0 6px 0;font-size:15px;line-height:1.8;color:${C.ink};">${rich(i.action.intro)}</p>
        <ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.9;color:${C.body};">
          ${(i.action.items || []).map((x) => `<li>${rich(x)}</li>`).join("")}
        </ol>
        ${i.action.note ? `<p style="margin:8px 0 0 0;font-size:14px;line-height:1.7;color:${C.muted};">${rich(i.action.note)}</p>` : ""}
      </td></tr>
    </table>
  </td></tr>` : "";

  return `<!--
  templateType: email
  isAvailableForNewContent: false
  label: Symcio 雙週刊 #${esc(i.issueNo)} (${esc(i.date)})
-->
<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(i.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(i.previewText || "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.card};border-top:5px solid ${C.green};">
  <tr><td style="padding:28px 32px 8px 32px;font-family:${SANS};">
    <div style="font-family:${MONO};font-size:12px;letter-spacing:2px;color:${C.gold};">SYMCIO 全識 · 品牌治理雙週刊</div>
    <div style="font-size:13px;color:${C.muted};margin-top:4px;">第 ${esc(i.issueNo)} 期 · ${y} 年 ${Number(m)} 月</div>
  </td></tr>
  <tr><td style="padding:12px 32px 20px 32px;font-family:${SANS};">
    <h1 style="margin:0;font-family:${SERIF};font-size:28px;line-height:1.35;color:${C.ink};">${rich(i.headline)}</h1>
    <p style="margin:14px 0 0 0;font-size:15px;line-height:1.8;color:${C.body};">${rich(i.intro)}</p>
  </td></tr>
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid ${C.line};"></div></td></tr>
  ${sections}
  ${action}
  <tr><td style="background:${C.green};padding:26px 32px;font-family:${SANS};">
    <div style="font-family:${SERIF};font-size:20px;color:${C.onGreen};">${esc(i.cta.title)}</div>
    <p style="margin:8px 0 16px 0;font-size:14px;line-height:1.7;color:${C.onGreenBody};">${rich(i.cta.body)}</p>
    <a href="${esc(i.cta.url)}" style="display:inline-block;background:${C.goldSoft};color:${C.ink};font-size:15px;font-weight:bold;text-decoration:none;padding:12px 22px;">${esc(i.cta.button || "了解更多")}</a>
  </td></tr>
  <tr><td style="padding:20px 32px 26px 32px;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.foot};">
    你收到這封信，是因為你訂閱了 Symcio 品牌治理雙週刊。<br>
    {{ site_settings.company_name }}<br>{{ site_settings.company_street_address_1 }} {{ site_settings.company_city }}<br>
    <a href="{{ unsubscribe_link_all }}" style="color:${C.foot};">取消訂閱</a> · <a href="{{ unsubscribe_link }}" style="color:${C.foot};">管理訂閱偏好</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>
`;
}

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
