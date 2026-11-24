/**
 * 網站對外 origin（無結尾斜線）。
 * 容錯處理 NEXT_PUBLIC_SITE_URL 常見設定錯誤：前後空白、缺少 https://、結尾斜線、帶路徑。
 * Stripe success_url / cancel_url 需要完整有效的絕對網址，格式錯誤會讓結帳整個失敗。
 */
// 正式站以 www 為主網域（apex 會 308 轉址；Stripe webhook 不跟隨轉址）
const FALLBACK = "https://www.symcio.tw";

export function siteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return FALLBACK;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return FALLBACK;
  }
}
