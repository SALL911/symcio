import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 穩定升級短網址：symcio.tw/upgrade → Stripe Checkout（kit-upgrade，$260）。
 * Gumroad 收據信只引用此網址，金額或金流變更不需修改 Gumroad。
 * 可帶 ?email= 預填結帳 email。
 */
export function GET(req: Request): Response {
  const url = new URL(req.url);
  const target = new URL("/api/checkout", url.origin);
  target.searchParams.set("product", "kit-upgrade");
  const email = url.searchParams.get("email");
  if (email) target.searchParams.set("email", email);
  return NextResponse.redirect(target, { status: 307 });
}
