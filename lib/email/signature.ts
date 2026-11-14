/**
 * Symcio Email 署名（單一來源）
 *
 * 所有交易信、Free Scan 信、利益人信的頁尾都從這裡產生，改一處即全站生效。
 *
 * 公開欄位（姓名、標語、DOI、網站、公司信箱）寫在程式碼中。
 * 個人聯絡方式（電話、LINE、個人信箱）只從環境變數讀取，避免在公開 repo 被爬取；
 * 未設定時該段自動省略：
 *   EMAIL_SIG_PHONE       例：0980-xxx-xxx
 *   EMAIL_SIG_LINE        例：LINE ID
 *   EMAIL_SIG_ALT_EMAIL   例：個人 Gmail
 */

export const SIGNATURE = {
  name: "黃智詮 Sall Huang",
  title: "Symcio 創辦人",
  org: "Symcio（籌備中）",
  tagline: "讓 AI 正確介紹你的品牌：數據可查・AI 可見・品牌可估",
  paperLabel: "BCI 品牌資本指數 方法論論文",
  paperUrl: "https://doi.org/10.5281/zenodo.20419081",
  site: "symcio.tw",
  siteUrl: "https://symcio.tw",
  email: "sall@symcio.tw",
} as const;

function env(key: string): string | undefined {
  const v = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return v && v.trim() ? v.trim() : undefined;
}

function contacts() {
  return {
    altEmail: env("EMAIL_SIG_ALT_EMAIL"),
    line: env("EMAIL_SIG_LINE"),
    phone: env("EMAIL_SIG_PHONE"),
  };
}

function esc(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** 純文字署名（Gmail 草稿、純文字信） */
export function signatureText(): string {
  const c = contacts();
  const emails = [SIGNATURE.email, c.altEmail].filter(Boolean).join(" ");
  const tail = [
    SIGNATURE.site,
    emails,
    c.line ? `LINE：${c.line}` : undefined,
    c.phone,
  ].filter(Boolean).join("｜");
  return [
    "================================",
    `${SIGNATURE.name}｜${SIGNATURE.title}`,
    `${SIGNATURE.org}｜${SIGNATURE.tagline}`,
    `${SIGNATURE.paperLabel}：${SIGNATURE.paperUrl}`,
    tail,
  ].join("\n");
}

/** 英文純文字署名（英文信使用；標語為中文版的對應英譯） */
export function signatureTextEn(): string {
  const c = contacts();
  const emails = [SIGNATURE.email, c.altEmail].filter(Boolean).join(" ");
  const tail = [SIGNATURE.site, emails, c.line ? `LINE: ${c.line}` : undefined, c.phone ? `+886 ${c.phone.replace(/^0/, "")}` : undefined]
    .filter(Boolean)
    .join(" | ");
  return [
    "================================",
    "Sall Huang (黃智詮) | Founder, Symcio",
    "Symcio (in formation) | Helping AI describe your brand accurately: verifiable data · AI visibility · brand valuation",
    `BCI (Brand Capital Index) methodology paper: ${SIGNATURE.paperUrl}`,
    tail,
  ].join("\n");
}

/** HTML 署名（放進 <td> 內），color 為頁尾文字色 */
export function signatureHtml(color = "#6B7280"): string {
  const c = contacts();
  const a = (href: string, text: string) =>
    `<a href="${esc(href)}" style="color:${color};">${esc(text)}</a>`;
  const tail = [
    a(SIGNATURE.siteUrl, SIGNATURE.site),
    [a(`mailto:${SIGNATURE.email}`, SIGNATURE.email), c.altEmail ? a(`mailto:${c.altEmail}`, c.altEmail) : ""]
      .filter(Boolean)
      .join(" "),
    c.line ? `LINE：${esc(c.line)}` : "",
    c.phone ? esc(c.phone) : "",
  ].filter(Boolean).join("｜");
  return [
    `<strong style="color:${color};">${esc(SIGNATURE.name)}</strong>｜${esc(SIGNATURE.title)}<br>`,
    `${esc(SIGNATURE.org)}｜${esc(SIGNATURE.tagline)}<br>`,
    `${esc(SIGNATURE.paperLabel)}：${a(SIGNATURE.paperUrl, SIGNATURE.paperUrl)}<br>`,
    tail,
  ].join("\n");
}
