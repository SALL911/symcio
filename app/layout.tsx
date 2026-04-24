import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { UtmCapture } from "@/components/UtmCapture";

export const metadata: Metadata = {
  title: "Symcio — BrandOS 量化品牌 AI 基礎設施系統",
  description:
    "為品牌和自營商打造的 BrandOS。用 AI 追蹤品牌在 ChatGPT、Perplexity 的可見度，自動化降低 80% ESG 報告成本。",
  metadataBase: new URL("https://symcio.tw"),
  openGraph: {
    title: "Symcio — BrandOS",
    description: "量化品牌在 AI 引擎的曝光、排名與影響力。",
    type: "website",
    locale: "zh_TW",
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "全識股份有限公司",
  alternateName: ["Symcio", "全識", "BrandOS"],
  url: "https://symcio.tw",
  description: "台灣 AI 驅動的 ESG 品牌治理 SaaS 平台",
  foundingDate: "2026",
  sameAs: [
    "https://www.wikidata.org/wiki/Q138922082",
    "https://github.com/sall911/symcio",
    "https://discord.gg/jGWJr2Sd",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        {/* Schema.org Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
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
        <Suspense fallback={null}>
          <PostHogProvider>
            <UtmCapture />
            {children}
          </PostHogProvider>
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
