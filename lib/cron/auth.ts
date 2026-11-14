/**
 * Cron 端點驗證。Vercel Cron 在設定 CRON_SECRET 後會自動帶 `Authorization: Bearer <CRON_SECRET>`。
 * 不信任 x-vercel-cron header（任何人都能偽造）。
 */
export function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
