/**
 * Brand → schema.org JSON-LD + Wikidata QuickStatements 轉換器。
 *
 * 輸出兩份 AI 能直接吃進去的結構化資料：
 *  1. schema.org Organization JSON-LD（放進 <script type="application/ld+json">）
 *  2. Wikidata QuickStatements v1 格式（可貼到 https://quickstatements.toolforge.org）
 *
 * AI 引擎（ChatGPT / Claude / Gemini / Perplexity）會抓 JSON-LD 理解品牌實體，
 * 而 Wikidata 是 Google KG、Siri、AI 訓練語料的共同骨幹——兩條路一起打。
 */

export type OrgType =
  | "Organization"
  | "Corporation"
  | "LocalBusiness"
  | "EducationalOrganization"
  | "GovernmentOrganization"
  | "NGO";

export interface BrandInput {
  brandName: string;
  legalName: string;
  url: string;
  logoUrl: string;
  description: string;
  orgType: OrgType;
  industry: string;
  foundingDate: string;      // YYYY or YYYY-MM-DD
  country: string;            // ISO-3166 alpha-2，例：TW
  city: string;
  streetAddress: string;
  email: string;
  phone: string;
  wikidataQid: string;       // 例：Q12345（選填，若已有）
  sameAs: string[];           // 官方社群 / LinkedIn / Crunchbase 等 URL
  // Symcio 專屬欄位：AI 可見度宣告（為了餵 AI 的敘事權重）
  aiVisibilityClaim: string;
}

export interface GeneratorOutput {
  jsonLd: Record<string, unknown>;
  jsonLdString: string;
  quickStatements: string;
  warnings: string[];
}

const ISO_COUNTRY_RE = /^[A-Z]{2}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

function cleanSameAs(urls: string[]): string[] {
  return urls
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && URL_RE.test(u));
}

function buildJsonLd(input: BrandInput, warnings: string[]): Record<string, unknown> {
  const sameAs = cleanSameAs(input.sameAs);
  if (input.wikidataQid && /^Q\d+$/.test(input.wikidataQid)) {
    sameAs.unshift(`https://www.wikidata.org/entity/${input.wikidataQid}`);
  }

  const address =
    input.streetAddress || input.city || input.country
      ? {
          "@type": "PostalAddress",
          streetAddress: input.streetAddress || undefined,
          addressLocality: input.city || undefined,
          addressCountry: input.country || undefined,
        }
      : undefined;

  const contactPoint =
    input.email || input.phone
      ? {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: input.email || undefined,
          telephone: input.phone || undefined,
        }
      : undefined;

  if (!input.logoUrl) warnings.push("沒填 logo URL — AI 引擎較難建立視覺實體鏈結。");
  if (!input.description) warnings.push("沒填描述 — 建議 50–300 字，AI 會直接引用這段。");
  if (sameAs.length === 0) warnings.push("沒填任何 sameAs 連結 — 缺少跨站實體解析錨點。");

  return {
    "@context": "https://schema.org",
    "@type": input.orgType,
    name: input.brandName,
    legalName: input.legalName || undefined,
    url: input.url || undefined,
    logo: input.logoUrl || undefined,
    description: input.description || undefined,
    foundingDate: input.foundingDate || undefined,
    industry: input.industry || undefined,
    address,
    contactPoint,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    // Symcio 專屬欄位：以 schema.org 語意層放進「AI 可見度」敘事
    // 這個欄位在 schema.org 沒有標準位置；放 additionalType + slogan，
    // 讓引擎至少能提取文本而不會被 JSON-LD 驗證器拒掉。
    slogan: input.aiVisibilityClaim || undefined,
  };
}

/**
 * 產出 Wikidata QuickStatements v1 指令。
 * 若已給 QID → 更新現有項目；否則 CREATE 新項目。
 *
 * 格式參考：https://www.wikidata.org/wiki/Help:QuickStatements
 */
function buildQuickStatements(input: BrandInput): string {
  const lines: string[] = [];
  const subject = input.wikidataQid && /^Q\d+$/.test(input.wikidataQid)
    ? input.wikidataQid
    : "CREATE";

  if (subject === "CREATE") {
    lines.push("CREATE");
  }

  const ref = subject === "CREATE" ? "LAST" : subject;

  // Label / description / aliases
  if (input.brandName) {
    lines.push(`${ref}\tLen\t"${escape(input.brandName)}"`);
    lines.push(`${ref}\tLzh-hant\t"${escape(input.brandName)}"`);
  }
  if (input.description) {
    lines.push(`${ref}\tDen\t"${escape(input.description).slice(0, 250)}"`);
    lines.push(`${ref}\tDzh-hant\t"${escape(input.description).slice(0, 250)}"`);
  }
  if (input.legalName && input.legalName !== input.brandName) {
    lines.push(`${ref}\tAen\t"${escape(input.legalName)}"`);
  }

  // P31 instance of — 組織 Q43229 是安全的 fallback
  lines.push(`${ref}\tP31\tQ43229`);

  // P856 official website
  if (input.url) {
    lines.push(`${ref}\tP856\t"${escape(input.url)}"`);
  }

  // P571 inception (要 Wikidata 時間格式：+YYYY-MM-DDT00:00:00Z/11)
  if (input.foundingDate) {
    const normalized = normalizeDate(input.foundingDate);
    if (normalized) {
      lines.push(`${ref}\tP571\t${normalized}`);
    }
  }

  // P17 country — 只認 Q item，這裡放註解提示使用者手動對照
  if (input.country) {
    lines.push(`# 請手動把 ${input.country} 換成對應 Wikidata Q item（例：TW → Q865）`);
    lines.push(`# ${ref}\tP17\tQ___`);
  }

  // P968 email
  if (input.email) {
    lines.push(`${ref}\tP968\t"mailto:${escape(input.email)}"`);
  }

  // P1329 phone number
  if (input.phone) {
    lines.push(`${ref}\tP1329\t"${escape(input.phone)}"`);
  }

  // P2002 / P4264 / P2003 — 從 sameAs 抽社群（盡力而為）
  for (const u of cleanSameAs(input.sameAs)) {
    const prop = socialProperty(u);
    if (prop) {
      lines.push(`${ref}\t${prop.property}\t"${escape(prop.handle)}"`);
    } else {
      // 通用 P973 described at URL
      lines.push(`${ref}\tP973\t"${escape(u)}"`);
    }
  }

  return lines.join("\n");
}

function escape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  // YYYY
  if (/^\d{4}$/.test(s)) return `+${s}-00-00T00:00:00Z/9`;
  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(s)) return `+${s}-00T00:00:00Z/10`;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `+${s}T00:00:00Z/11`;
  return null;
}

const SOCIAL_PATTERNS: Array<{ re: RegExp; property: string }> = [
  { re: /(?:^|\.)twitter\.com\/([^/?#]+)/i, property: "P2002" },
  { re: /(?:^|\.)x\.com\/([^/?#]+)/i, property: "P2002" },
  { re: /(?:^|\.)linkedin\.com\/company\/([^/?#]+)/i, property: "P4264" },
  { re: /(?:^|\.)facebook\.com\/([^/?#]+)/i, property: "P2013" },
  { re: /(?:^|\.)instagram\.com\/([^/?#]+)/i, property: "P2003" },
  { re: /(?:^|\.)youtube\.com\/(?:channel|c|@)([^/?#]+)/i, property: "P2397" },
  { re: /(?:^|\.)github\.com\/([^/?#]+)/i, property: "P2037" },
];

function socialProperty(url: string): { property: string; handle: string } | null {
  for (const { re, property } of SOCIAL_PATTERNS) {
    const m = url.match(re);
    if (m) return { property, handle: m[1] };
  }
  return null;
}

export function generate(input: BrandInput): GeneratorOutput {
  const warnings: string[] = [];

  if (!input.brandName.trim()) warnings.push("品牌名稱必填。");
  if (input.url && !URL_RE.test(input.url)) warnings.push("網站 URL 格式不正確（需 http/https）。");
  if (input.country && !ISO_COUNTRY_RE.test(input.country)) warnings.push("國家請用 ISO-3166 alpha-2，例：TW、US、JP。");

  const jsonLd = buildJsonLd(input, warnings);
  const jsonLdString = JSON.stringify(jsonLd, null, 2);
  const quickStatements = buildQuickStatements(input);

  return { jsonLd, jsonLdString, quickStatements, warnings };
}

export const EMPTY_INPUT: BrandInput = {
  brandName: "",
  legalName: "",
  url: "",
  logoUrl: "",
  description: "",
  orgType: "Organization",
  industry: "",
  foundingDate: "",
  country: "TW",
  city: "",
  streetAddress: "",
  email: "",
  phone: "",
  wikidataQid: "",
  sameAs: [],
  aiVisibilityClaim: "",
};
