#!/usr/bin/env node
// GEO / technical-SEO auditor for symcio.tw (zero dependencies, Node >= 18).
// Crawls sitemap + internal links from a base URL and scores each page on
// signals that matter for Google indexing and AI answer-engine citation.
//
// Usage:
//   node .claude/skills/geo-optimizer/scripts/audit.mjs [baseUrl] [--json out.json] [--md out.md] [--min-score N]
//   baseUrl defaults to https://symcio.tw ; use http://localhost:3000 after `npm run build && npm start`.
//   --min-score makes the process exit 1 when the site score is below N (CI gate).

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const BASE = (args.find((a) => /^https?:\/\//.test(a)) || "https://symcio.tw").replace(/\/$/, "");
const CANONICAL_HOST = "https://symcio.tw";
const MAX_PAGES = 200;

const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"];

async function get(path) {
  const url = path.startsWith("http") ? path : BASE + path;
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "SymcioGeoAudit/1.0" } });
    const body = res.status < 300 ? await res.text() : "";
    return { url, status: res.status, location: res.headers.get("location"), body, type: res.headers.get("content-type") || "" };
  } catch (e) {
    return { url, status: 0, body: "", error: String(e) };
  }
}

// Map a canonical-host URL onto the audited base so localhost audits work.
const toLocal = (u) => u.replace(CANONICAL_HOST, BASE);
const toPath = (u) => {
  try {
    const x = new URL(u, BASE + "/");
    return x.pathname;
  } catch {
    return null;
  }
};

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3]) : undefined;
};
const metaContent = (html, key) => {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, "name") === key || attr(tag, "property") === key) return attr(tag, "content");
  }
  return undefined;
};
const linkHref = (html, rel) => {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if ((attr(tag, "rel") || "").split(/\s+/).includes(rel)) return attr(tag, "href");
  }
  return undefined;
};
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ");
const visibleText = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
// CJK chars count as one "word" each; latin tokens count as words.
const wordCount = (t) => (t.match(/[㐀-鿿]/g) || []).length + (t.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;

function jsonLdTypes(html) {
  const types = [];
  const errors = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object") {
          if (n["@type"]) [].concat(n["@type"]).forEach((t) => types.push(t));
          Object.values(n).forEach(walk);
        }
      };
      walk(JSON.parse(m[1]));
    } catch (e) {
      errors.push(String(e).slice(0, 80));
    }
  }
  return { types, errors };
}

function auditPage(path, res) {
  const html = res.body;
  const issues = [];
  const add = (sev, code, msg) => issues.push({ sev, code, msg });
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();
  const desc = metaContent(html, "description");
  const robots = metaContent(html, "robots") || "";
  const canonical = linkHref(html, "canonical");
  const lang = (html.match(/<html[^>]*\blang=["']([^"']+)/i) || [])[1];
  const h1s = (html.match(/<h1\b/gi) || []).length;
  const text = visibleText(html.replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, " "));
  const words = wordCount(text);
  const { types, errors } = jsonLdTypes(html);
  const noindex = /noindex/i.test(robots);

  if (!title) add("high", "title-missing", "缺少 <title>");
  else if (title.length > 60) add("low", "title-long", `title 過長 (${title.length} 字元)`);
  if (!desc) add("high", "desc-missing", "缺少 meta description");
  else if (desc.length > 160) add("low", "desc-long", `description 過長 (${desc.length} 字元)`);
  if (!noindex) {
    if (!canonical) add("high", "canonical-missing", "缺少 canonical");
    else if (toPath(canonical) !== path && toPath(canonical) + "/" !== path && toPath(canonical) !== path + "/")
      add("med", "canonical-mismatch", `canonical 指向 ${canonical}`);
    if (!metaContent(html, "og:title")) add("med", "og-title-missing", "缺少 og:title");
    if (!metaContent(html, "og:image")) add("med", "og-image-missing", "缺少 og:image（社群/AI 摘要卡片）");
    if (!metaContent(html, "og:url")) add("low", "og-url-missing", "缺少 og:url");
    if (!metaContent(html, "twitter:card")) add("low", "twitter-card-missing", "缺少 twitter:card");
    if (!lang) add("med", "lang-missing", "缺少 <html lang>");
    if (h1s === 0) add("med", "h1-missing", "缺少 H1");
    if (h1s > 1) add("low", "h1-multiple", `H1 數量 ${h1s}`);
    if (types.length === 0) add("med", "jsonld-missing", "無 JSON-LD 結構化資料");
    if (errors.length) add("high", "jsonld-invalid", `JSON-LD 解析失敗: ${errors[0]}`);
    if (words < 150) add("med", "thin-content", `可見內容偏少 (${words} 字)`);
    // GEO: answer engines prefer extractable facts and definitional sentences.
    if (!/[0-9０-９]/.test(text)) add("low", "geo-no-stats", "無任何數據/數字，可引用性低");
    if (!/(是|為|is an?|refers to)/.test(text.slice(0, 1500))) add("low", "geo-no-definition", "前段缺少定義句（X 是…）");
  }
  return { path, status: res.status, title, desc, canonical, noindex, h1s, words, jsonld: [...new Set(types)], issues };
}

async function main() {
  const site = { issues: [] };
  const siteIssue = (sev, code, msg) => site.issues.push({ sev, code, msg });

  // robots.txt
  const robots = await get("/robots.txt");
  if (robots.status !== 200) siteIssue("high", "robots-missing", "robots.txt 不存在");
  else {
    if (!/^sitemap:/im.test(robots.body)) siteIssue("med", "robots-no-sitemap", "robots.txt 未宣告 Sitemap");
    for (const bot of AI_BOTS) {
      const block = robots.body.split(/\n(?=user-agent:)/i).find((b) => new RegExp(`user-agent:\\s*${bot}\\b`, "i").test(b));
      if (block && /disallow:\s*\/\s*$/im.test(block)) siteIssue("high", "ai-bot-blocked", `${bot} 被封鎖`);
    }
  }

  // llms.txt
  const llms = await get("/llms.txt");
  if (llms.status !== 200) siteIssue("high", "llms-missing", "llms.txt 不存在");
  else if (!/^# /m.test(llms.body)) siteIssue("med", "llms-format", "llms.txt 缺少 H1 標題");

  // sitemap
  const sm = await get("/sitemap.xml");
  const sitemapUrls = [...sm.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (sm.status !== 200) siteIssue("high", "sitemap-missing", "sitemap.xml 不存在");
  if (sitemapUrls.length && !/<lastmod>/.test(sm.body)) siteIssue("low", "sitemap-no-lastmod", "sitemap 缺少 lastmod");

  // crawl
  const queue = ["/", ...sitemapUrls.map((u) => toPath(toLocal(u)))].filter(Boolean);
  const seen = new Set();
  const pages = [];
  const inSitemap = new Set(sitemapUrls.map((u) => toPath(toLocal(u))));
  while (queue.length && seen.size < MAX_PAGES) {
    const path = queue.shift();
    if (seen.has(path) || /\.(txt|xml|json|png|jpe?g|svg|ico|pdf)$/i.test(path) || path.startsWith("/api/")) continue;
    seen.add(path);
    const res = await get(path);
    if (res.status >= 300 && res.status < 400) {
      if (inSitemap.has(path)) siteIssue("med", "sitemap-redirect", `sitemap 內 ${path} 轉址到 ${res.location}`);
      const loc = res.location && toPath(res.location);
      if (loc && !seen.has(loc)) queue.push(loc);
      continue;
    }
    if (res.status !== 200 || !/html/.test(res.type)) {
      if (inSitemap.has(path)) siteIssue("high", "sitemap-broken", `sitemap 內 ${path} 回應 ${res.status}`);
      else siteIssue("med", "broken-link", `內部連結 ${path} 回應 ${res.status}`);
      continue;
    }
    const page = auditPage(path, res);
    pages.push(page);
    if (!page.noindex && !inSitemap.has(path)) page.issues.push({ sev: "med", code: "not-in-sitemap", msg: "可索引頁面未列入 sitemap" });
    for (const m of res.body.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)) {
      const href = m[1];
      if (/^(mailto:|tel:|javascript:)/.test(href)) continue;
      const abs = new URL(href, BASE + path);
      if (abs.origin === new URL(BASE).origin || abs.origin === CANONICAL_HOST) queue.push(abs.pathname);
    }
  }

  // duplicates
  const dup = (key, code, label) => {
    const by = {};
    for (const p of pages.filter((p) => !p.noindex && p[key])) (by[p[key]] ||= []).push(p.path);
    for (const [v, ps] of Object.entries(by)) if (ps.length > 1) siteIssue("med", code, `${label}重複: ${ps.join(", ")} → "${v.slice(0, 50)}"`);
  };
  dup("title", "title-duplicate", "title ");
  dup("desc", "desc-duplicate", "description ");

  const allTypes = new Set(pages.flatMap((p) => p.jsonld));
  for (const t of ["Organization", "WebSite", "FAQPage", "BreadcrumbList"])
    if (!allTypes.has(t)) siteIssue("med", "schema-gap", `全站缺少 ${t} 結構化資料`);

  // scoring: start at 100, subtract weighted issue counts (per-page issues averaged)
  const W = { high: 10, med: 4, low: 1 };
  const pagePenalty = pages.length ? pages.reduce((s, p) => s + p.issues.reduce((a, i) => a + W[i.sev], 0), 0) / pages.length : 50;
  const sitePenalty = site.issues.reduce((a, i) => a + W[i.sev], 0);
  const score = Math.max(0, Math.round(100 - pagePenalty * 1.5 - sitePenalty));

  const report = { base: BASE, generatedAt: new Date().toISOString(), score, pagesAudited: pages.length, site, pages };

  const lines = [`# GEO / SEO Audit — ${BASE}`, "", `- Score: **${score}/100**`, `- Pages audited: ${pages.length}`, `- Generated: ${report.generatedAt}`, "", "## Site-level issues", ""];
  if (!site.issues.length) lines.push("- none");
  for (const i of site.issues) lines.push(`- [${i.sev}] \`${i.code}\` ${i.msg}`);
  lines.push("", "## Pages", "", "| Path | Words | JSON-LD | Issues |", "|---|---|---|---|");
  for (const p of pages)
    lines.push(`| ${p.path}${p.noindex ? " (noindex)" : ""} | ${p.words} | ${p.jsonld.join(", ") || "—"} | ${p.issues.map((i) => `${i.sev}:${i.code}`).join("<br>") || "✓"} |`);
  const md = lines.join("\n") + "\n";

  const fs = await import("node:fs");
  if (flag("--json")) fs.writeFileSync(flag("--json"), JSON.stringify(report, null, 2));
  if (flag("--md")) fs.writeFileSync(flag("--md"), md);
  process.stdout.write(md);
  const min = Number(flag("--min-score"));
  if (min && score < min) {
    console.error(`Score ${score} below --min-score ${min}`);
    process.exit(1);
  }
}

main();
