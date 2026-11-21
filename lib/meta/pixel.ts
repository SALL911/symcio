// Meta Pixel 共用設定與事件 helper。
// Pixel ID 屬公開識別碼（會出現在前端 HTML），非機密；可用 NEXT_PUBLIC_META_PIXEL_ID 覆寫。
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "2383984185680148";

type Fbq = (...args: unknown[]) => void;

/** 送 Meta Pixel 事件；pixel 未載入（被擋 / SSR）時靜默略過。 */
export function fbqTrack(
  event: string,
  params: Record<string, unknown> = {},
  custom = false,
): void {
  if (typeof window === "undefined") return;
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (typeof fbq === "function") fbq(custom ? "trackCustom" : "track", event, params);
  } catch {
    /* ignore */
  }
}
