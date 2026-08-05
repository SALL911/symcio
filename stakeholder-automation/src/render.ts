import type { Digest } from "./digest";

export interface Stakeholder {
  name: string;
  segment: string;
  region: string;
  email?: string;
  language: "en" | "zh";
  weeklyOptIn: boolean;
  status: string;
  notes?: string;
}

export interface RenderedEmail {
  subject: string;
  text: string;
}

function banner(s: Stakeholder): string {
  const hasEmail = !!(s.email && s.email.trim());
  const target = hasEmail ? s.email : "（收件人未填 — 此草稿先存為備份，請補上真實 email 再寄）";
  return [
    "─────────────────────────────────────",
    "⚠️ 草稿備份，審閱後手動寄出。",
    `建議寄件帳號：sall@symcio.tw`,
    `實際收件人：${target}`,
    "─────────────────────────────────────",
    "",
  ].join("\n");
}

function renderZh(s: Stakeholder, d: Digest): RenderedEmail {
  const subject = `Symcio Weekly · ${d.title}`;
  const highlights = d.highlights
    .map((h, i) => `${i + 1}. ${h.heading}\n   ${h.oneLiner}`)
    .join("\n");
  const text = [
    banner(s),
    `${s.name} 您好，`,
    "",
    "這是 Symcio 本週的 ESG / SDG 重點整理，附 Brand Capital(品牌資本)解讀。",
    "",
    `【本週摘要】${d.summary}`,
    "",
    "【重點】",
    highlights,
    "",
    "【Brand Capital 解讀】",
    d.brandCapitalTake[0] ?? "",
    "",
    "【Symcio 業務更新】",
    d.businessUpdate,
    "",
    `完整內容：${d.newsUrl}`,
    "",
    "如不希望續收每週摘要，回覆「退訂」即可。",
    "",
    "順頌時祺",
    "黃智詮 Sall ｜ Symcio 全識（籌備中）",
    "sall@symcio.tw ｜ https://symcio.tw",
  ].join("\n");
  return { subject, text };
}

function renderEn(s: Stakeholder, d: Digest): RenderedEmail {
  const subject = `Symcio Weekly · ESG/SDG & Brand Capital — ${d.publishedAt}`;
  const highlights = d.highlights
    .map((h, i) => `${i + 1}. ${h.heading}`)
    .join("\n");
  const text = [
    banner(s),
    `Dear ${s.name},`,
    "",
    "Symcio's weekly digest of ESG / SDG developments, with a Brand Capital read-through.",
    "",
    `This week: ${d.summary}`,
    "",
    "Highlights:",
    highlights,
    "",
    "Business update:",
    d.businessUpdate,
    "",
    `Full issue: ${d.newsUrl}`,
    "",
    "To stop receiving this weekly digest, just reply 'unsubscribe'.",
    "",
    "Best regards,",
    "Sall Huang | Symcio 全識 (in formation)",
    "sall@symcio.tw | https://symcio.tw",
  ].join("\n");
  return { subject, text };
}

export function renderWeekly(s: Stakeholder, d: Digest): RenderedEmail {
  return s.language === "en" ? renderEn(s, d) : renderZh(s, d);
}
