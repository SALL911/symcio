import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// 只在會員相關路徑刷新 session；公開行銷頁不多打一次 Supabase。
// /dashboard 是公開排行榜，不在此列。
export const config = {
  matcher: ["/member/:path*", "/login", "/signup"],
};
