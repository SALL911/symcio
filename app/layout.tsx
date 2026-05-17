import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { UtmCapture } from "@/components/UtmCapture";

export const metadata: Metadata = {
  title: "Symcio · BrandOS — AI 能見度的量化標準",
  description:
    "3 分鐘看見 AI 怎麼描述你的品牌。跨 ChatGPT / Claude / Gemini / Perplexity 四引擎品牌曝光量化,ABVI 方法論開源公開。",
  metadataBase: new URL("https://symcio.tw"),
  openGraph: {
    title: "Symcio · BrandOS",
    description: "AI 能見度的量化標準。跨四引擎品牌曝光觀察指標,開源方法論。",
    type: "website",
    locale: "zh_TW",
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Symcio · BrandOS",
  alternateName: ["Symcio", "BrandOS"],
  url: "https://symcio.tw",
  description:
    "AI 品牌曝光量化方法論與工具集。跨四引擎觀察性指標,開源公開。",
  sameAs: [
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
