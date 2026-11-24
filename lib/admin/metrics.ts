import type { SupabaseClient } from "@supabase/supabase-js";

export type DailyRow = {
  day: string;
  sessions: number;
  leads: number;
  grade_a: number;
  paid_orders: number;
  revenue_twd: number;
  spend_twd: number;
};

export type Totals = Omit<DailyRow, "day">;

export const USD_TWD = Number(process.env.USD_TWD_RATE) > 0 ? Number(process.env.USD_TWD_RATE) : 32;

/** 台北時間的 YYYY-MM-DD */
export function taipeiDate(offsetDays = 0): string {
  const d = new Date(Date.now() + 8 * 3600_000 + offsetDays * 86400_000);
  return d.toISOString().slice(0, 10);
}

export async function loadDaily(sb: SupabaseClient, days: number): Promise<{ rows: DailyRow[]; error?: string }> {
  const { data, error } = await sb.rpc("acquisition_daily", {
    p_since: taipeiDate(-(days - 1)),
    p_usd_twd: USD_TWD,
  });
  if (error) return { rows: [], error: error.message };
  const rows = ((data || []) as Record<string, unknown>[]).map((r) => ({
    day: String(r.day),
    sessions: Number(r.sessions) || 0,
    leads: Number(r.leads) || 0,
    grade_a: Number(r.grade_a) || 0,
    paid_orders: Number(r.paid_orders) || 0,
    revenue_twd: Number(r.revenue_twd) || 0,
    spend_twd: Number(r.spend_twd) || 0,
  }));
  return { rows };
}

export function sum(rows: DailyRow[]): Totals {
  const t: Totals = { sessions: 0, leads: 0, grade_a: 0, paid_orders: 0, revenue_twd: 0, spend_twd: 0 };
  for (const r of rows) {
    t.sessions += r.sessions;
    t.leads += r.leads;
    t.grade_a += r.grade_a;
    t.paid_orders += r.paid_orders;
    t.revenue_twd += r.revenue_twd;
    t.spend_twd += r.spend_twd;
  }
  return t;
}

/** 比率；分母為 0 時回 null，畫面顯示「—」而不是 0% 或無限大 */
export function ratio(n: number, d: number): number | null {
  return d > 0 ? n / d : null;
}

export const fmtPct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);
export const fmtTwd = (v: number | null) => (v === null ? "—" : `NT$${Math.round(v).toLocaleString("en-US")}`);
export const fmtNum = (v: number) => v.toLocaleString("en-US");

export type SourceRow = { source: string; leads: number; a: number; converted: number };

/** 依來源彙總名單（utm_source 優先，否則用表單來源）。最多取最近 1000 筆。 */
export async function loadSources(sb: SupabaseClient, days: number): Promise<SourceRow[]> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data } = await sb
    .from("leads")
    .select("source, utm_source, grade, status")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1000);
  const map = new Map<string, SourceRow>();
  for (const r of (data || []) as { source: string | null; utm_source: string | null; grade: string | null; status: string | null }[]) {
    const key = r.utm_source ? `${r.utm_source}（廣告 / 連結）` : r.source || "unknown";
    const row = map.get(key) || { source: key, leads: 0, a: 0, converted: 0 };
    row.leads++;
    if (r.grade === "A") row.a++;
    if (r.status === "converted") row.converted++;
    map.set(key, row);
  }
  return [...map.values()].sort((x, y) => y.leads - x.leads);
}
