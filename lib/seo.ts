import type { Metadata } from "next";

/**
 * 全站 SEO / GEO 單一來源。
 *
 * 每個頁面用 pageMetadata() 產生 metadata，確保都有 canonical、og:url、
 * og:image、twitter card。Next.js 的 openGraph 是「整包覆寫」而非合併，
 * 頁面若自己寫 openGraph 會遺失 layout 的 og:image，所以統一走這裡。
 */

export const SITE_URL = "https://symcio.tw";
export const SITE_NAME = "Symcio · BrandOS";
export const OG_IMAGE = "/opengraph-image";
export const WIKIDATA_URL = "https://www.wikidata.org/wiki/Q138922082";

interface PageMetaInput {
  title: string;
  description: string;
  /** 路徑，例如 "/pricing"；首頁用 "/" */
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  /** 社群卡片標題，預設同 title */
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const ogTitle = input.ogTitle ?? input.title;
  const ogDescription = input.ogDescription ?? input.description;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: input.path,
      siteName: SITE_NAME,
      locale: "zh_TW",
      type: input.type ?? "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE],
    },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** BreadcrumbList JSON-LD。items 依序為 [名稱, 路徑]，首頁自動加入。 */
export function breadcrumbSchema(items: Array<[string, string]>) {
  const all: Array<[string, string]> = [["Symcio", "/"], ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path === "/" ? "" : path}`,
    })),
  };
}
