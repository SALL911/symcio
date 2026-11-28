import Link from "next/link";
import { leadsSupabase } from "@/lib/leads/capture";
import { sequenceEnabled } from "@/brandos/followup/schedule";
import { aiConfigured } from "@/brandos/ai/model";
import {
  fmtNum,
  fmtPct,
  fmtTwd,
  loadDaily,
  loadSources,
  ratio,
  sum,
  taipeiDate,
  USD_TWD,
} from "@/lib/admin/metrics";
import { saveAdSpend } from "./actions";

const RANGES = [7, 30, 90];

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-dim">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: { days?: string } }) {
  const days = RANGES.includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const sb = leadsSupabase();

  if (!sb) {
    return (
      <p className="rounded-card border border-warning bg-surface p-4 text-sm">
        尚未設定 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，看板沒有資料來源。
      </p>
    );
  }

  const [{ rows, error }, sources] = await Promise.all([loadDaily(sb, days), loadSources(sb, days)]);
  const t = sum(rows);
  const maxLeads = Math.max(1, ...rows.map((r) => r.leads));
  const maxSessions = Math.max(1, ...rows.map((r) => r.sessions));

  const funnel = [
    { label: "訪客", value: t.sessions, rate: null as number | null },
    { label: "名單", value: t.leads, rate: ratio(t.leads, t.sessions) },
    { label: "A 級名單", value: t.grade_a, rate: ratio(t.grade_a, t.leads) },
    { label: "付款訂單", value: t.paid_orders, rate: ratio(t.paid_orders, t.leads) },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">獲客成交漏斗</h1>
          <p className="mt-1 text-sm text-muted">
            最近 {days} 天（台北時間）。營收含美元訂單，以 1 USD = {USD_TWD} TWD 換算。
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {RANGES.map((d) => (
            <Link
              key={d}
              href={`/admin?days=${d}`}
              className={`rounded-card border px-3 py-1 no-underline ${
                d === days ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink hover:border-accent"
              }`}
            >
              {d} 天
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-card border border-danger bg-surface p-4 text-sm">
          讀取失敗：{error}。請確認 BrandOS-Infrastructure 的 migration 20261124000000_acquisition_funnel 已套用。
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="訪客（不重複）" value={fmtNum(t.sessions)} />
        <Tile label="名單" value={fmtNum(t.leads)} hint={`訪客轉名單 ${fmtPct(ratio(t.leads, t.sessions))}`} />
        <Tile label="付款訂單" value={fmtNum(t.paid_orders)} hint={`名單轉付款 ${fmtPct(ratio(t.paid_orders, t.leads))}`} />
        <Tile label="營收" value={fmtTwd(t.revenue_twd)} />
        <Tile label="廣告花費" value={fmtTwd(t.spend_twd)} hint="手動輸入，見頁面下方" />
        <Tile label="每筆名單成本 CPL" value={fmtTwd(ratio(t.spend_twd, t.leads))} />
        <Tile
          label="廣告投報 ROAS"
          value={t.spend_twd > 0 ? `${(t.revenue_twd / t.spend_twd).toFixed(2)}x` : "—"}
          hint="營收 ÷ 廣告花費"
        />
        <Tile
          label="ROI"
          value={fmtPct(t.spend_twd > 0 ? (t.revenue_twd - t.spend_twd) / t.spend_twd : null)}
          hint="（營收 − 花費）÷ 花費，未計人力與金流手續費"
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold">漏斗各階段</h2>
        <ol className="mt-3 grid gap-3 md:grid-cols-4">
          {funnel.map((f, i) => (
            <li key={f.label} className="rounded-card border border-line bg-surface p-4">
              <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-sm text-muted">{f.label}</p>
              <p className="text-xl font-semibold tabular-nums">{fmtNum(f.value)}</p>
              <p className="mt-1 text-xs text-muted-dim">{i === 0 ? "起點" : `上一階段轉化 ${fmtPct(f.rate)}`}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted">
          「付款訂單」包含未先留名單就直接購買電子書的訂單，因此名單轉付款的比率可能超過實際名單成交率。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">每日明細</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-normal">日期</th>
                <th className="px-3 py-2 font-normal">訪客</th>
                <th className="px-3 py-2 font-normal">名單</th>
                <th className="px-3 py-2 text-right font-normal">A 級</th>
                <th className="px-3 py-2 text-right font-normal">訂單</th>
                <th className="px-3 py-2 text-right font-normal">營收</th>
                <th className="px-3 py-2 text-right font-normal">花費</th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((r) => (
                <tr key={r.day} className="border-b border-line-soft last:border-0">
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs">{r.day}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right tabular-nums">{r.sessions}</span>
                      <span className="h-2 rounded bg-accent-soft" style={{ width: `${(r.sessions / maxSessions) * 80}px` }} />
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right tabular-nums">{r.leads}</span>
                      <span className="h-2 rounded bg-accent" style={{ width: `${(r.leads / maxLeads) * 80}px` }} />
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{r.grade_a}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{r.paid_orders}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{r.revenue_twd ? fmtTwd(r.revenue_twd) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{r.spend_twd ? fmtTwd(r.spend_twd) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">名單來源</h2>
        {sources.length === 0 ? (
          <p className="mt-3 text-sm text-muted">這段期間沒有名單。</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="border-b border-line text-left text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-normal">來源</th>
                  <th className="px-3 py-2 text-right font-normal">名單</th>
                  <th className="px-3 py-2 text-right font-normal">A 級</th>
                  <th className="px-3 py-2 text-right font-normal">已成交</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.source} className="border-b border-line-soft last:border-0">
                    <td className="px-3 py-1.5">{s.source}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{s.leads}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{s.a}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{s.converted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">輸入廣告花費</h2>
        <p className="mt-1 text-sm text-muted">同一天、同通路、同活動名稱再次輸入會覆寫原金額。</p>
        <form action={saveAdSpend} className="mt-3 grid gap-3 rounded-card border border-line bg-surface p-4 md:grid-cols-5">
          <label className="text-xs text-muted">
            日期
            <input name="spend_date" type="date" required defaultValue={taipeiDate()} className="mt-1 block w-full rounded border border-line px-2 py-1.5 text-sm text-ink" />
          </label>
          <label className="text-xs text-muted">
            通路
            <select name="channel" defaultValue="meta" className="mt-1 block w-full rounded border border-line px-2 py-1.5 text-sm text-ink">
              <option value="meta">Meta</option>
              <option value="google">Google</option>
              <option value="linkedin">LinkedIn</option>
              <option value="line">LINE</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label className="text-xs text-muted">
            活動名稱（選填）
            <input name="campaign" maxLength={255} className="mt-1 block w-full rounded border border-line px-2 py-1.5 text-sm text-ink" />
          </label>
          <label className="text-xs text-muted">
            金額（新台幣）
            <input name="amount_twd" type="number" min="0" step="1" required className="mt-1 block w-full rounded border border-line px-2 py-1.5 text-sm text-ink" />
          </label>
          <button type="submit" className="self-end rounded-card bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim">
            儲存
          </button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-surface-2 p-4 text-sm">
        <h2 className="font-semibold">系統狀態</h2>
        <ul className="mt-2 space-y-1 text-muted">
          <li>AI 分級與私訊回覆：{aiConfigured() ? "已啟用（Gemini）" : "未設定金鑰，使用規則分級與固定範本"}</li>
          <li>D2 / D5 跟進信：{sequenceEnabled() ? "已啟用" : "關閉（只寄 D0 確認信）"}</li>
          <li>Meta Conversions API：{process.env.META_CAPI_ACCESS_TOKEN ? "已設定" : "未設定權杖，只有瀏覽器 Pixel"}</li>
          <li>跟進信排程密鑰 CRON_SECRET：{process.env.CRON_SECRET ? "已設定" : "未設定，排程會被拒絕"}</li>
        </ul>
      </section>
    </div>
  );
}
