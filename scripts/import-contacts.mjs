#!/usr/bin/env node
/**
 * 匯入聯絡人到電子報名單（一律 status=pending，等本人點確認信才會收週報）。
 *
 * 來源：
 *   --csv <file>   Google 聯絡人 / Outlook / LinkedIn / Apple 匯出的 CSV（自動偵測 email 欄位）
 *   --hubspot      HubSpot 全部 contacts（排除 hs_email_optout=true）
 *
 * 選項：
 *   --dry-run      只列出統計，不寫入
 *   --source <s>   newsletter_subscribers.source，預設 import-csv / import-hubspot
 *
 * 環境變數：SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, (HUBSPOT_PRIVATE_APP_TOKEN)
 *
 * 範例：
 *   node scripts/import-contacts.mjs --csv ~/Downloads/contacts.csv --dry-run
 *   node scripts/import-contacts.mjs --hubspot
 *
 * 已存在的 email（active / unsubscribed / bounced）完全不動；退訂者永遠不會被重新加入。
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
// 角色信箱 / 系統信箱不寄行銷信
const BLOCK_RE = /^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?|support|billing|invoice)@/i;

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim()));
}

function fromCsv(file) {
  const rows = parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""));
  const header = rows.shift().map((h) => h.trim().toLowerCase());
  const emailCols = header.map((h, i) => (/e-?mail/.test(h) && !/type|label/.test(h) ? i : -1)).filter((i) => i >= 0);
  const nameCol = header.findIndex((h) => h === "name" || h === "full name" || h === "姓名");
  const first = header.findIndex((h) => h === "first name" || h === "given name" || h === "名字");
  const last = header.findIndex((h) => h === "last name" || h === "family name" || h === "姓氏");
  if (!emailCols.length) throw new Error(`找不到 email 欄位。表頭：${header.join(", ")}`);
  const out = [];
  for (const r of rows) {
    const name = (nameCol >= 0 ? r[nameCol] : [r[first], r[last]].filter(Boolean).join(" ")) || null;
    for (const i of emailCols) {
      // Google 匯出可能把多個 email 以 " ::: " 串在同一格
      for (const e of (r[i] || "").split(/\s*:::\s*|[;,\s]+/)) out.push({ email: e, name });
    }
  }
  return out;
}

async function fromHubSpot() {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) throw new Error("HUBSPOT_PRIVATE_APP_TOKEN 未設定");
  const out = [];
  let after;
  do {
    const u = new URL("https://api.hubapi.com/crm/v3/objects/contacts");
    u.searchParams.set("limit", "100");
    u.searchParams.set("properties", "email,firstname,lastname,hs_email_optout");
    if (after) u.searchParams.set("after", after);
    const r = await fetch(u, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`HubSpot HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    for (const c of j.results ?? []) {
      const p = c.properties ?? {};
      if (p.hs_email_optout === "true") continue;
      out.push({ email: p.email, name: [p.firstname, p.lastname].filter(Boolean).join(" ") || null });
    }
    after = j.paging?.next?.after;
  } while (after);
  return out;
}

async function main() {
  const csv = opt("--csv");
  if (!csv && !flag("--hubspot")) {
    console.error("用法：--csv <file> 或 --hubspot（可加 --dry-run）");
    process.exit(1);
  }
  const raw = csv ? fromCsv(csv) : await fromHubSpot();
  const source = opt("--source") || (csv ? "import-csv" : "import-hubspot");

  const seen = new Map();
  let invalid = 0, blocked = 0;
  for (const { email, name } of raw) {
    const e = (email || "").trim().toLowerCase();
    if (!e) continue;
    if (!EMAIL_RE.test(e)) { invalid++; continue; }
    if (BLOCK_RE.test(e)) { blocked++; continue; }
    if (!seen.has(e)) seen.set(e, { email: e, display_name: name?.trim() || null, source, status: "pending" });
  }
  const rows = [...seen.values()];
  console.log(`讀入 ${raw.length} 筆 → 有效且去重 ${rows.length} 筆（格式錯誤 ${invalid}、系統信箱 ${blocked}）`);
  if (flag("--dry-run")) {
    console.log("dry-run，前 5 筆：", rows.slice(0, 5));
    return;
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未設定");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  let written = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { data, error } = await sb
      .from("newsletter_subscribers")
      .upsert(chunk, { onConflict: "email", ignoreDuplicates: true })
      .select("id");
    if (error) throw new Error(`寫入失敗：${error.message}`);
    written += data?.length ?? 0;
  }
  console.log(`新增 pending ${written} 筆；其餘已存在、未變更。下次週報 cron 會寄出確認邀請（每次上限 NEWSLETTER_INVITE_CAP）。`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
