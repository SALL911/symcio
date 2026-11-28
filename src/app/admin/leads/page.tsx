import Link from "next/link";
import { leadsSupabase } from "@/lib/leads/capture";
import { LEAD_STATUSES } from "@/lib/admin/statuses";
import { updateLeadStatus } from "../actions";

type Lead = {
  id: string;
  created_at: string;
  name: string | null;
  company: string | null;
  email: string | null;
  source: string | null;
  status: string | null;
  notes: string | null;
  grade: string | null;
  intent: string | null;
  ai_summary: string | null;
  sales_script: string | null;
  score: number | null;
  utm_source: string | null;
  utm_campaign: string | null;
  followup_opt_out: boolean | null;
};

const STATUS_LABEL: Record<string, string> = {
  new: "新進",
  contacted: "已聯絡",
  qualified: "有效商機",
  converted: "已成交",
  lost: "未成交",
};

const GRADE_STYLE: Record<string, string> = {
  A: "bg-accent text-white",
  B: "bg-accent-soft text-accent",
  C: "bg-line text-muted",
};

const PAGE = 50;

function fmtTime(iso: string): string {
  return new Date(new Date(iso).getTime() + 8 * 3600_000).toISOString().slice(5, 16).replace("T", " ");
}

export default async function AdminLeads({
  searchParams,
}: {
  searchParams: { grade?: string; status?: string; page?: string };
}) {
  const grade = ["A", "B", "C"].includes(searchParams.grade || "") ? searchParams.grade! : "";
  const status = (LEAD_STATUSES as readonly string[]).includes(searchParams.status || "") ? searchParams.status! : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const sb = leadsSupabase();
  if (!sb) {
    return (
      <p className="rounded-card border border-warning bg-surface p-4 text-sm">
        尚未設定 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，無法讀取名單。
      </p>
    );
  }

  let q = sb
    .from("leads")
    .select(
      "id, created_at, name, company, email, source, status, notes, grade, intent, ai_summary, sales_script, score, utm_source, utm_campaign, followup_opt_out",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (grade) q = q.eq("grade", grade);
  if (status) q = q.eq("status", status);
  const { data, error, count } = await q;
  const leads = (data || []) as Lead[];
  const total = count ?? leads.length;

  const href = (p: Record<string, string | number>) => {
    const sp = new URLSearchParams();
    const merged = { grade, status, page: 1, ...p };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "page" && v === 1)) sp.set(k, String(v));
    const s = sp.toString();
    return s ? `/admin/leads?${s}` : "/admin/leads";
  };
  const chip = (active: boolean) =>
    `rounded-card border px-3 py-1 text-sm no-underline ${
      active ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-accent"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">名單管理</h1>
        <p className="mt-1 text-sm text-muted">共 {total} 筆。分級由進件時的規則與 AI 判定；建議話術僅供內部參考。</p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">分級</span>
          <Link href={href({ grade: "" })} className={chip(!grade)}>全部</Link>
          {["A", "B", "C"].map((g) => (
            <Link key={g} href={href({ grade: g })} className={chip(grade === g)}>{g}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">狀態</span>
          <Link href={href({ status: "" })} className={chip(!status)}>全部</Link>
          {LEAD_STATUSES.map((s) => (
            <Link key={s} href={href({ status: s })} className={chip(status === s)}>{STATUS_LABEL[s]}</Link>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-card border border-danger bg-surface p-4 text-sm">
          讀取失敗：{error.message}。請確認 migration 20261124000000_acquisition_funnel 已套用。
        </p>
      )}

      {!error && leads.length === 0 && <p className="text-sm text-muted">沒有符合條件的名單。</p>}

      <ul className="space-y-3">
        {leads.map((l) => (
          <li key={l.id} className="rounded-card border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  GRADE_STYLE[l.grade || ""] || "border border-line text-muted"
                }`}
                title="分級"
              >
                {l.grade || "–"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold">
                  {l.company || "（未填公司）"} <span className="font-normal text-muted">· {l.name}</span>
                </p>
                <p className="break-all text-sm">
                  <a href={`mailto:${l.email}`} className="text-accent">{l.email}</a>
                </p>
                <p className="mt-1 text-xs text-muted">
                  {fmtTime(l.created_at)} · {l.source}
                  {l.utm_source ? ` · ${l.utm_source}${l.utm_campaign ? ` / ${l.utm_campaign}` : ""}` : ""}
                  {l.intent ? ` · 意圖 ${l.intent}` : ""}
                  {typeof l.score === "number" && l.score > 0 ? ` · 分數 ${l.score}` : ""}
                  {l.followup_opt_out ? " · 已退訂跟進信" : ""}
                </p>
              </div>
              <form action={updateLeadStatus} className="flex w-full items-center gap-2 md:w-auto">
                <input type="hidden" name="id" value={l.id} />
                <select
                  name="status"
                  defaultValue={(LEAD_STATUSES as readonly string[]).includes(l.status || "") ? l.status! : "new"}
                  aria-label="名單狀態"
                  className="rounded border border-line px-2 py-1.5 text-sm"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button type="submit" className="rounded-card border border-accent px-3 py-1.5 text-sm text-accent hover:bg-accent hover:text-white">
                  更新
                </button>
              </form>
            </div>
            {l.ai_summary && <p className="mt-3 text-sm">{l.ai_summary}</p>}
            {l.notes && <p className="mt-2 break-words text-sm text-muted">{l.notes}</p>}
            {l.sales_script && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-accent">建議下一步</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-bg p-3 font-sans text-sm">{l.sales_script}</pre>
              </details>
            )}
          </li>
        ))}
      </ul>

      {total > PAGE && (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 && <Link href={href({ page: page - 1 })} className={chip(false)}>← 上一頁</Link>}
          <span className="text-muted">第 {page} / {Math.ceil(total / PAGE)} 頁</span>
          {page * PAGE < total && <Link href={href({ page: page + 1 })} className={chip(false)}>下一頁 →</Link>}
        </div>
      )}
    </div>
  );
}
