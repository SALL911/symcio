/**
 * Markdown body → sanitized HTML for /geo/[slug].
 *
 * Unlike 文件站的 render which loads from filesystem, geo content lives in
 * Supabase (geo_content.content). This helper takes the markdown string in
 * memory, runs the same unified/remark pipeline, and returns sanitized HTML.
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
