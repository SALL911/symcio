import type { FakeReport } from "./fake-data";

const INK = "#0B0F19";
const ACCENT = "#FFD24A";
const MUTED = "#6B7280";

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:${MUTED};font-size:13px;width:180px;">${label}</td>
    <td style="padding:8px 0;color:${INK};font-size:14px;"><strong>${value}</strong></td>
  </tr>`;
}

function engineRow(e: FakeReport["engines"][number]): string {
  const status = e.mentioned
    ? `提及 · 排名 ${e.rank} · ${e.sentiment}`
    : "未提及";
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:${INK};width:120px;text-transform:uppercase;">${e.engine}</td>
    <td style="padding:6px 0;font-size:13px;color:${MUTED};">${status}</td>
  </tr>`;
}

export function renderReportEmail(report: FakeReport): {
  subject: string;
  html: string;
} {
  const subject = `[Symcio] ${report.brand} AI 曝光快照：${report.composite_score}/100（${report.band}）`;

  const engineRows = report.engines.map(engineRow).join("");
  const competitorsHtml = report.top_competitors
    .map(
      (c) =>
        `<span style="display:inline-block;border:1px solid ${MUTED};padding:2px 8px;margin:2px 4px 2px 0;font-size:12px;color:${INK};">${c}</span>`,
    )
    .join("");

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";
  const checkoutUrl =
    `${origin}/api/checkout?product=audit` +
    `&brand=${encodeURIComponent(report.brand)}`;

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;color:${INK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #eee;">
          <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:${MUTED};text-transform:uppercase;">
            Symcio · AI Visibility Intelligence
          </p>
          <h1 style="margin:6px 0 0;font-size:22px;color:${INK};">
            ${report.brand} AI 曝光快照
          </h1>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <div style="background:${INK};color:#fff;padding:18px 20px;margin-bottom:20px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:${ACCENT};text-transform:uppercase;">
              ABVI Composite Score
            </p>
            <p style="margin:6px 0 0;font-size:40px;font-weight:600;">
              ${report.composite_score}<span style="font-size:18px;color:#888;">/100</span>
              <span style="display:inline-block;margin-left:12px;padding:4px 10px;background:${ACCENT};color:${INK};font-size:12px;font-weight:600;">${report.band}</span>
            </p>
          </div>

          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${INK};">
            ${report.summary}
          </p>

          <table width="100%" style="border-top:1px solid #eee;margin-top:12px;">
            ${row("Brand", report.brand)}
            ${row("Mention Rate", `${report.mention_rate_pct}%（測試四引擎 × 多 prompt）`)}
            ${row("Composite Band", report.band)}
            ${row("Generated", report.generated_at.replace("T", " ").slice(0, 19) + " UTC")}
          </table>

          <h2 style="margin:28px 0 10px;font-size:14px;letter-spacing:0.12em;color:${MUTED};text-transform:uppercase;">
            四引擎結果
          </h2>
          <table width="100%" style="border-top:1px solid #eee;">
            ${engineRows}
          </table>

          <h2 style="margin:28px 0 10px;font-size:14px;letter-spacing:0.12em;color:${MUTED};text-transform:uppercase;">
            同框出現的競品
          </h2>
          <div>${competitorsHtml}</div>

          <div style="margin-top:32px;padding:20px;background:#FAFAFA;border-left:3px solid ${ACCENT};">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;color:${MUTED};text-transform:uppercase;">
              下一步
            </p>
            <p style="margin:0 0 12px;font-size:14px;color:${INK};">
              本快照為 Free Scan。完整 $299 AI Visibility Audit 包含：20 個產業 prompt × 4 引擎、競品 radar、3 項可執行改善建議、24 小時內交付。
            </p>
            <a href="${checkoutUrl}"
               style="display:inline-block;background:${INK};color:${ACCENT};padding:10px 18px;font-size:14px;font-weight:600;text-decoration:none;">
              升級 $299 AI Visibility Audit →
            </a>
          </div>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid #eee;color:${MUTED};font-size:11px;">
          Symcio · AI Visibility Intelligence · <a href="https://symcio.tw" style="color:${MUTED};">symcio.tw</a>
          <br>
          你因在 symcio.tw 提交 Free Scan 收到此信。若非本人操作可忽略。
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
