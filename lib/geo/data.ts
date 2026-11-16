/**
 * geo_content 讀取層（僅伺服器端）。
 *
 * WHY
 *   社群貼文與 AI 引擎引用都需要一個公開、可長期存取的文章網址。
 *   內容的單一真相來源是 Supabase 的 geo_content，由 BrandOS-Infrastructure 的
 *   geo-publisher 從 approved 流轉為 published 後，這裡才讀得到。
 *
 * 只回傳 status='published' 且有 slug 的列；環境變數缺漏或查詢失敗一律回空結果，
 * 錯誤細節只寫 server log，不顯示在頁面上。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface GeoSummary {
  id: string;
  slug: string;
  title: string | null;
  content_type: string | null;
  target_queries: string[] | null;
  published_at: string | null;
  created_at: string;
}

export interface GeoArticle extends GeoSummary {
  content: string;
  updated_at: string;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,253}[a-z0-9]$/;

function client(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function listGeoArticles(limit = 100): Promise<GeoSummary[]> {
  const sb = client();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("geo_content")
      .select("id, slug, title, content_type, target_queries, published_at, created_at")
      .eq("status", "published")
      .not("slug", "is", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) {
      console.error("[geo] list failed:", error.message);
      return [];
    }
    return (data as GeoSummary[] | null) ?? [];
  } catch (e) {
    console.error("[geo] list threw:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getGeoArticle(slug: string): Promise<GeoArticle | null> {
  if (!SLUG_RE.test(slug)) return null;
  const sb = client();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("geo_content")
      .select("id, slug, title, content, content_type, target_queries, published_at, created_at, updated_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      console.error("[geo] get failed:", error.message);
      return null;
    }
    return (data as GeoArticle | null) ?? null;
  } catch (e) {
    console.error("[geo] get threw:", e instanceof Error ? e.message : e);
    return null;
  }
}

export function formatGeoDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
