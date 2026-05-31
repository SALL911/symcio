import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sortedEntries } from "../../lib/news-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

export interface Digest {
  issueSlug: string;
  publishedAt: string;
  title: string;
  summary: string;
  categories: string[];
  highlights: { heading: string; oneLiner: string }[];
  brandCapitalTake: string[];
  businessUpdate: string;
  newsUrl: string;
}

export function buildDigest(): Digest {
  const latest = sortedEntries()[0];
  if (!latest) throw new Error("No news entries found in lib/news-data.ts");

  const updatePath = path.join(ROOT, "weekly-update.md");
  const businessUpdate = fs.existsSync(updatePath)
    ? fs.readFileSync(updatePath, "utf8").trim()
    : "（本週業務更新未提供：請建立 weekly-update.md）";

  return {
    issueSlug: latest.slug,
    publishedAt: latest.publishedAt,
    title: latest.title,
    summary: latest.summary,
    categories: latest.categories,
    highlights: latest.sections.map((s) => ({
      heading: s.heading,
      oneLiner: s.body[0] ?? "",
    })),
    brandCapitalTake: latest.brandCapitalTake,
    businessUpdate,
    newsUrl: `https://symcio.tw/news/${latest.slug}`,
  };
}

// Allow `npm run digest` to print the digest as a sanity check.
if (process.argv[1] && process.argv[1].endsWith("digest.ts")) {
  console.log(JSON.stringify(buildDigest(), null, 2));
}
