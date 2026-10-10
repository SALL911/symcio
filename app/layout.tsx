import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { PostHogProvider, PostHogPageView } from "@/components/PostHogProvider";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, WIKIDATA_URL, pageMetadata } from "@/lib/seo";
import { UtmCapture } from "@/components/UtmCapture";

// 全站預設值。刻意不設 canonical / og:url：子頁若漏設會繼承成「指向首頁」，
// 等同叫 Google 不要索引該頁。每頁一律用 pageMetadata() 自帶 canonical。
const { alternates: _alternates, ...rootDefaults } = pageMetadata({
  title: "Symcio · BrandOS — AI 能見度的量化標準",
  description:
    "3 分鐘看見 AI 怎麼描述你的品牌。跨 ChatGPT / Claude / Gemini / Perplexity 四引擎品牌曝光量化,ABVI 方法論開源公開。",
  path: "/",
});
if (rootDefaults.openGraph) delete (rootDefaults.openGraph as { url?: unknown }).url;

export const metadata: Metadata = {
  ...rootDefaults,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  // Google Search Console 驗證：在 Vercel 設定 NEXT_PUBLIC_GSC_VERIFICATION 後自動輸出 meta tag
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

// Organization + WebSite 實體宣告。sameAs 指向 Wikidata，讓 AI 引擎把網站與知識圖譜實體對齊。
const SITE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Symcio",
    legalName: "全識股份有限公司",
    alternateName: ["全識", "Symcio · BrandOS", "BrandOS"],
    url: SITE_URL,
    logo: `${SITE_URL}/symcio-logo.svg`,
    description:
      "Symcio 是台灣的 AI Visibility Intelligence（AVI）平台，量化品牌在 ChatGPT、Claude、Gemini、Perplexity 四大 AI 引擎中的曝光、排名與影響力。",
    foundingLocation: { "@type": "Place", name: "Taiwan" },
    areaServed: "TW",
    knowsAbout: [
      "AI Visibility Intelligence",
      "Generative Engine Optimization",
      "Brand valuation",
      "ESG",
      "TNFD",
    ],
    sameAs: [
      WIKIDATA_URL,
      "https://github.com/sall911/symcio",
      "https://discord.gg/jGWJr2Sd",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "zh-Hant",
    publisher: { "@id": `${SITE_URL}/#organization` },
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        {/* Schema.org Organization + WebSite */}
        <JsonLd data={SITE_SCHEMA} />
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QPB9W2885C"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QPB9W2885C');
          `}
        </Script>
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
        {/* useSearchParams 只能在獨立 Suspense 內，否則整站 bailout 成 CSR（爬蟲讀到空白頁） */}
        <Suspense fallback={null}>
          <PostHogPageView />
          <UtmCapture />
        </Suspense>
        {/* Start of HubSpot Embed Code */}
        <Script
          id="hs-script-loader"
          src="//js-na2.hs-scripts.com/245975397.js"
          strategy="afterInteractive"
          async
          defer
        />
        {/* End of HubSpot Embed Code */}
      </body>
    </html>
  );
}
