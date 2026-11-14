// 共用：期數檔驗證與 HTML 版型（HubSpot 草稿與 Resend 寄送共用）

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

export function validate(i) {
  const need = ["date", "issueNo", "subject", "headline", "intro", "sections", "cta"];
  const miss = need.filter((k) => i[k] === undefined || i[k] === "");
  if (miss.length) throw new Error(`期數檔缺少欄位：${miss.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.date)) throw new Error("date 格式要是 YYYY-MM-DD");
  if (!/^https:\/\//.test(i.cta.url || "")) throw new Error("cta.url 要是 https 開頭的網址");
}

export function render(i, { footer = "hubspot" } = {}) {
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

  const head = footer === "hubspot" ? `<!--
  templateType: email
  isAvailableForNewContent: false
  label: Symcio 雙週刊 #${esc(i.issueNo)} (${esc(i.date)})
-->
` : "";
  return `${head}<!doctype html>
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
    ${footer === "resend"
      ? `Symcio 全識（籌備處）· info@symcio.tw<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${C.foot};">取消訂閱</a>`
      : `{{ site_settings.company_name }}<br>{{ site_settings.company_street_address_1 }} {{ site_settings.company_city }}<br>
    <a href="{{ unsubscribe_link_all }}" style="color:${C.foot};">取消訂閱</a> · <a href="{{ unsubscribe_link }}" style="color:${C.foot};">管理訂閱偏好</a>`}
  </td></tr>
</table>
</td></tr></table>
</body></html>
`;
}

