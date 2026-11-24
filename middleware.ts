import { NextResponse, type NextRequest } from "next/server";

// 內部後台（/admin）以 HTTP Basic Auth 保護。
// 未設定 ADMIN_USER / ADMIN_PASSWORD 時後台完全關閉（503），不會意外對外開放。
export const config = { matcher: ["/admin/:path*"] };

function safeEqual(a: string, b: string): boolean {
  // 固定時間比較，避免從回應時間猜出密碼
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return new NextResponse("Admin is not configured.", { status: 503 });
  }
  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(":");
      const okUser = safeEqual(decoded.slice(0, i), user);
      const okPass = safeEqual(decoded.slice(i + 1), pass);
      if (i > 0 && okUser && okPass) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
    } catch {
      /* 格式錯誤視同未授權 */
    }
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Symcio Admin", charset="UTF-8"' },
  });
}
