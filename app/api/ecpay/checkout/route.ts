import { NextResponse } from "next/server";
import { getEcpayConfig, buildCheckoutParams, ECPAY_PRODUCTS, type EcpayProduct } from "@/lib/ecpay/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function autoSubmitForm(actionUrl: string, params: Record<string, string>): string {
  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${escapeAttr(k)}" value="${escapeAttr(v)}">`)
    .join("");
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><title>前往綠界付款…</title></head>
<body onload="document.forms[0].submit()" style="font-family:sans-serif;text-align:center;padding:48px;">
<p>正在前往綠界 ECPay 安全付款頁面，請稍候…</p>
<form method="post" action="${escapeAttr(actionUrl)}">${inputs}<noscript><button type="submit">繼續付款</button></noscript></form>
</body></html>`;
}

export async function GET(req: Request): Promise<Response> {
  const product = (new URL(req.url).searchParams.get("product") || "ebook") as string;
  if (!(product in ECPAY_PRODUCTS)) {
    return NextResponse.json({ ok: false, error: "invalid-product" }, { status: 400 });
  }
  const email = new URL(req.url).searchParams.get("email") || undefined;

  const config = getEcpayConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: "ecpay-not-configured" }, { status: 503 });
  }

  const params = buildCheckoutParams({
    config,
    product: product as EcpayProduct,
    origin: ORIGIN,
    email,
  });

  return new NextResponse(autoSubmitForm(config.actionUrl, params), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
