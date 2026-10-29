import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function doLogout(request: NextRequest) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore: user may already be signed out / Supabase not configured.
  }
  // 303：POST 表單登出後以 GET 導回首頁
  return NextResponse.redirect(new URL("/", request.url), 303);
}

export async function POST(request: NextRequest) {
  return doLogout(request);
}

export async function GET(request: NextRequest) {
  return doLogout(request);
}
