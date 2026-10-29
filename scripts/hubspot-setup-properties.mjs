#!/usr/bin/env node
/**
 * 在 HubSpot 建立 Symcio 會員同步用的 contact 自訂屬性（可重複執行，已存在者略過）。
 * 需要 HUBSPOT_PRIVATE_APP_TOKEN（scope: crm.schemas.contacts.write）。
 */

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!token) { console.error("HUBSPOT_PRIVATE_APP_TOKEN 未設定"); process.exit(1); }

const PROPS = [
  { name: "symcio_signup_source", label: "Symcio 註冊來源", type: "string", fieldType: "text" },
  { name: "symcio_member_plan", label: "Symcio 會員方案", type: "string", fieldType: "text" },
  {
    name: "symcio_newsletter_opt_in", label: "Symcio 週報訂閱", type: "bool", fieldType: "booleancheckbox",
    options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
  },
];

for (const p of PROPS) {
  const r = await fetch("https://api.hubapi.com/crm/v3/properties/contacts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...p, groupName: "contactinformation" }),
  });
  if (r.ok) console.log(`✓ 建立 ${p.name}`);
  else if (r.status === 409) console.log(`· 已存在 ${p.name}`);
  else { console.error(`✗ ${p.name}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`); process.exitCode = 1; }
}
