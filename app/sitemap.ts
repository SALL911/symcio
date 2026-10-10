import type { MetadataRoute } from "next";
import { FAQ_CATEGORIES } from "@/lib/faq-data";
import { NEWS_ENTRIES } from "@/lib/news-data";
import { SITE_URL } from "@/lib/seo";

/**
 * 動態 sitemap — 取代原本手寫的 public/sitemap.xml。
 * FAQ 分類與電子報從資料檔自動展開，新增內容不必再手動維護。
 * 只列可索引頁面；/checkout、/u/[token] 為 noindex，不列入。
 * lastModified 只給有真實日期的內容（電子報），避免向 Google 送出不可信的 lastmod。
 */
const STATIC_ROUTES: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["/", 1.0, "weekly"],
  ["/audit", 0.9, "weekly"],
  ["/pricing", 0.9, "monthly"],
  ["/tools", 0.8, "monthly"],
  ["/tools/brand-check", 0.9, "weekly"],
  ["/tools/entity-builder", 0.8, "monthly"],
  ["/schema-generator", 0.7, "monthly"],
  ["/dashboard", 0.8, "weekly"],
  ["/about", 0.8, "monthly"],
  ["/faq", 0.9, "weekly"],
  ["/news", 0.7, "weekly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map(([path, priority, changeFrequency]) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      priority,
      changeFrequency,
    })),
    ...FAQ_CATEGORIES.map((c) => ({
      url: `${SITE_URL}/faq/${c.key}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...NEWS_ENTRIES.map((e) => ({
      url: `${SITE_URL}/news/${e.slug}`,
      lastModified: e.publishedAt,
      priority: 0.6,
      changeFrequency: "yearly" as const,
    })),
  ];
}
