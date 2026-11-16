/**
 * Markdown → 已消毒的 HTML，供 /geo/[slug] 使用。
 * geo_content.content 來自資料庫，一律經 remark-html 的 sanitize 處理後才輸出。
 */

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export async function renderGeoMarkdown(md: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: true })
    .process(md);
  return String(processed);
}

/** 去掉 front-matter 與 markdown 符號，給 meta description 用。 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[#*_`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
