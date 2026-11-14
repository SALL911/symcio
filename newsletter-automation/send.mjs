#!/usr/bin/env node
// Symcio 品牌治理雙週刊：自動寄送（Resend Broadcasts）
//
// 為什麼不用 HubSpot 寄：本帳號不是 Marketing Hub Enterprise，HubSpot API 無法寄行銷信。
// 訂閱入口仍是 symcio.tw/subscribe 的 HubSpot 表單；寄送前把表單訂閱者同步到 Resend。
//
// 用法：
//   node send.mjs preview   寄預覽給 PREVIEW_TO（下週二要發的那期）
//   node send.mjs send      今天（台北時間）有 status=ready 的期數檔就寄給全體訂閱者
//   DRY_RUN=true            只輸出 HTML 與名單數，不呼叫任何寄信 API
//
// 環境變數：
//   RESEND_API_KEY        必填
//   RESEND_SEGMENT_ID     必填（Resend「Symcio 雙週刊」segment）
//   NEWSLETTER_FROM       必填，例：Symcio 全識 <news@symcio.tw>（網域需在 Resend 驗證）
//   NEWSLETTER_REPLY_TO   選填
//   PREVIEW_TO            預覽收件人（逗號分隔）
//   HUBSPOT_TOKEN         選填；有的話從 HubSpot 表單同步訂閱者（需 forms 權限）
//   HUBSPOT_FORM_ID       預設 dedb5e0d-6df9-4f57-a2e9-b237c50db615
//   FORCE_DATE            選填，覆寫「今天」（YYYY-MM-DD），手動補發用

import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { render, validate } from "./render.mjs";

const MODE = process.argv[2] || "send";
const DRY = String(process.env.DRY_RUN).toLowerCase() === "true";
const RESEND = "https://api.resend.com";
const KEY = process.env.RESEND_API_KEY;
const SEGMENT = process.env.RESEND_SEGMENT_ID;
const FROM = process.env.NEWSLETTER_FROM;
const FORM_ID = process.env.HUBSPOT_FORM_ID || "dedb5e0d-6df9-4f57-a2e9-b237c50db615";

// 台北日期（GitHub Actions 跑在 UTC）
function taipeiDate(offsetDays = 0) {
  const d = new Date(Date.now() + 8 * 3600e3 + offsetDays * 86400e3);
  return d.toISOString().slice(0, 10);
}

async function loadIssue(date) {
  const file = path.join("issues", `${date}.json`);
  try {
    const issue = JSON.parse(await readFile(file, "utf8"));
    validate(issue);
    return issue;
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

async function api(method, url, body) {
  const res = await fetch(RESEND + url, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data };
}

async function must(method, url, body) {
  const r = await api(method, url, body);
  if (!r.ok) throw new Error(`Resend ${method} ${url} → ${r.status} ${JSON.stringify(r.data).slice(0, 400)}`);
  return r.data;
}

// 從 HubSpot 表單提交紀錄取得訂閱者 email
async function hubspotSubscribers() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return [];
  const emails = new Set();
  let after;
  for (let page = 0; page < 50; page++) {
    const url = `https://api.hubapi.com/form-integrations/v1/submissions/forms/${FORM_ID}?limit=50${after ? `&after=${after}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HubSpot 表單讀取失敗 ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    for (const s of data.results || []) {
      const v = (s.values || []).find((x) => x.name === "email");
      if (v?.value) emails.add(v.value.trim().toLowerCase());
    }
    after = data.paging?.next?.after;
    if (!after) break;
  }
  return [...emails];
}

// 只新增、不改動既有聯絡人（保留已取消訂閱者的狀態）
async function syncToResend(emails) {
  let added = 0;
  for (const email of emails) {
    const enc = encodeURIComponent(email);
    const got = await api("GET", `/contacts/${enc}`);
    if (got.status === 404) {
      await must("POST", "/contacts", { email });
      added++;
    } else if (!got.ok) {
      throw new Error(`Resend 查詢聯絡人失敗 ${got.status}`);
    }
    const seg = await api("POST", `/contacts/${enc}/segments/${SEGMENT}`);
    if (!seg.ok && seg.status !== 409) throw new Error(`加入 segment 失敗 ${seg.status} ${JSON.stringify(seg.data)}`);
    await new Promise((r) => setTimeout(r, 250)); // Resend 預設速率限制
  }
  return added;
}

async function alreadySent(name) {
  const list = await must("GET", "/broadcasts");
  return (list.data || []).some((b) => b.name === name && b.status !== "draft");
}

async function preview() {
  // 週五跑：預覽下週二（+4 天）的期數
  const date = process.env.FORCE_DATE || taipeiDate(4);
  const issue = await loadIssue(date);
  const to = (process.env.PREVIEW_TO || "").split(",").map((s) => s.trim()).filter(Boolean);
  let subject, html;
  if (!issue) {
    subject = `⚠️ 雙週刊 ${date} 沒有期數檔，週二不會寄出`;
    html = `<p>issues/${date}.json 不存在。若這週要發，請在週二 09:00 前新增並設 "status": "ready"。若本週本來就不發，忽略此信。</p>`;
  } else {
    const ready = issue.status === "ready";
    subject = `${ready ? "【預覽】" : "⚠️【未核准，週二不會寄】"}${issue.subject}`;
    html = (ready ? "" : `<p style="background:#fff3cd;padding:12px;">status 不是 "ready"。確認內容後把 issues/${date}.json 的 status 改成 "ready" 並合併到 main，週二 09:00 才會自動寄出。</p>`)
      + render(issue, { footer: "resend" });
  }
  await mkdir(".out", { recursive: true });
  await writeFile(path.join(".out", `preview-${date}.html`), html);
  console.log(`預覽：${subject}`);
  if (DRY || !to.length) return console.log(DRY ? "DRY_RUN，未寄出。" : "未設定 PREVIEW_TO，未寄出。");
  const r = await must("POST", "/emails", { from: FROM, to, subject, html, reply_to: process.env.NEWSLETTER_REPLY_TO });
  console.log(`預覽已寄出（id ${r.id}）→ ${to.join(", ")}`);
}

async function send() {
  const date = process.env.FORCE_DATE || taipeiDate(0);
  const issue = await loadIssue(date);
  if (!issue) return console.log(`今天（${date}）沒有期數檔，不寄。`);
  if (issue.status !== "ready") return console.log(`issues/${date}.json 的 status 不是 "ready"，不寄。`);

  const html = render(issue, { footer: "resend" });
  const name = `Symcio 品牌治理雙週刊 #${issue.issueNo}（${issue.date}）`;
  await mkdir(".out", { recursive: true });
  await writeFile(path.join(".out", `issue-${date}.html`), html);

  const subs = await hubspotSubscribers();
  console.log(`HubSpot 表單訂閱者：${subs.length} 人`);
  if (DRY) return console.log("DRY_RUN，未同步名單、未寄出。");
  for (const [k, v] of Object.entries({ RESEND_API_KEY: KEY, RESEND_SEGMENT_ID: SEGMENT, NEWSLETTER_FROM: FROM })) {
    if (!v) throw new Error(`缺少 ${k}`);
  }

  if (await alreadySent(name)) return console.log(`「${name}」已寄過，略過。`);
  const added = await syncToResend(subs);
  console.log(`同步到 Resend：新增 ${added} 人`);

  const b = await must("POST", "/broadcasts", {
    segment_id: SEGMENT,
    from: FROM,
    reply_to: process.env.NEWSLETTER_REPLY_TO,
    subject: issue.subject,
    preview_text: issue.previewText,
    name,
    html,
    send: true,
  });
  console.log(`已寄出（broadcast id ${b.id}）`);
}

(MODE === "preview" ? preview() : send()).catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
