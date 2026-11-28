import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// GEO 內容頁的唯讀 Supabase client。
// 優先使用 anon key（geo_content 有 public read 的 RLS policy，只放行已發布內容）；
// 未設定 anon key 時退回 service role，僅在伺服器端執行，查詢一律加 status='published'。
function createClient_(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 未設定：缺少 URL 或金鑰");
  return createClient(url, key, { auth: { persistSession: false } });
}

export { createClient_ as createClient };
