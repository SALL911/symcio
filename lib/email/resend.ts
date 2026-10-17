/**
 * Minimal Resend REST client.
 *
 * Why not @resend-node SDK: avoid extra dep when a single fetch does the job.
 * If RESEND_API_KEY is missing, send() returns ok:false with graceful error.
 */

const API = "https://api.resend.com";

export interface SendParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function send(params: SendParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "resend-not-configured" };

  try {
    const resp = await fetch(`${API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        reply_to: params.replyTo,
      }),
    });

    const text = await resp.text();
    if (!resp.ok) return { ok: false, error: `resend HTTP ${resp.status}: ${text.slice(0, 200)}` };

    try {
      const parsed = JSON.parse(text) as { id?: string };
      return { ok: true, id: parsed.id };
    } catch {
      return { ok: true };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function renderAuditConfirmation(params: {
  brandName: string;
  customerEmail: string;
  product: "audit" | "optimization";
}): { subject: string; html: string } {
  const productLabel =
    params.product === "optimization" ? "AI Visibility Optimization" : "AI Visibility Audit";
  const subject = `[Symcio] ${productLabel} 訂單確認 · ${params.brandName}`;

  const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:-apple-system,Segoe UI,Noto Sans TC,sans-serif;background:#f7f7f7;color:#0B0F19;">
  <table width="100%" style="padding:32px 16px;"><tr><td align="center">
    <table width="560" style="background:#fff;max-width:560px;">
      <tr><td style="padding:24px 32px;border-bottom:1px solid #eee;">
        <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:#6B7280;text-transform:uppercase;">
          Symcio · AI Visibility Intelligence
        </p>
        <h1 style="margin:6px 0 0;font-size:22px;">${productLabel} 訂單已收到</h1>
      </td></tr>
      <tr><td style="padding:24px 32px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
          感謝你購買 Symcio ${productLabel}。我們已啟動針對
          <strong>${params.brandName}</strong> 的四引擎測試（ChatGPT / Claude / Gemini / Perplexity）。
        </p>
        <div style="background:#0B0F19;color:#fff;padding:18px 20px;margin:12px 0;">
          <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:#FFD24A;text-transform:uppercase;">
            交付時程
          </p>
          <p style="margin:6px 0 0;font-size:16px;">
            正式報告將於 <strong>24 小時內</strong>寄到你的 email。
          </p>
        </div>
        <p style="margin:16px 0 0;font-size:13px;color:#6B7280;">
          如 48 小時後仍未收到，請來信 <a href="mailto:info@symcio.tw" style="color:#0B0F19;">info@symcio.tw</a>
          我們會親自追蹤。
        </p>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #eee;color:#6B7280;font-size:11px;">
        Symcio · AI Visibility Intelligence · <a href="https://symcio.tw" style="color:#6B7280;">symcio.tw</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Gumroad Starter Kit → VIP 專人建置升級（$260）付款確認信 */
export function renderKitUpgradeConfirmation(params: {
  gumroadEmail?: string;
  bookingUrl?: string;
}): { subject: string; html: string } {
  const subject = "[Symcio] VIP Concierge Full Setup 升級確認 · 下一步：預約建置時段";
  const booking = params.bookingUrl
    ? `<a href="${escapeHtml(params.bookingUrl)}" style="display:inline-block;background:#0B0F19;color:#fff;padding:12px 20px;text-decoration:none;font-size:14px;">預約遠端建置時段 / Book your setup session</a>`
    : "請直接回覆本信，提供兩個方便的遠端建置時段。";
  const credit = params.gumroadEmail
    ? `<p style="margin:0 0 16px;font-size:13px;color:#6B7280;">Gumroad 折抵帳號：${escapeHtml(params.gumroadEmail)}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:-apple-system,Segoe UI,Noto Sans TC,sans-serif;background:#f7f7f7;color:#0B0F19;">
  <table width="100%" style="padding:32px 16px;"><tr><td align="center">
    <table width="560" style="background:#fff;max-width:560px;">
      <tr><td style="padding:24px 32px;border-bottom:1px solid #eee;">
        <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:#6B7280;text-transform:uppercase;">
          Symcio · Starter Kit
        </p>
        <h1 style="margin:6px 0 0;font-size:22px;">VIP Concierge Full Setup 升級完成</h1>
      </td></tr>
      <tr><td style="padding:24px 32px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
          已收到你的 $260 升級款（$39 Starter Kit 已全額折抵）。下一步請預約遠端建置時段，
          並事先準備：GitHub 帳號、Vercel 帳號、HubSpot Super Admin 權限、欲綁定網域的 DNS 管理權限。
        </p>
        ${credit}
        <p style="margin:0 0 16px;">${booking}</p>
        <p style="margin:16px 0 0;font-size:13px;color:#6B7280;">
          48 小時上線時程自建置時段開始、且上述權限備妥後起算。14 天訊息支援自上線日起算。
        </p>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #eee;color:#6B7280;font-size:11px;">
        Symcio · <a href="https://symcio.tw" style="color:#6B7280;">symcio.tw</a> · 回覆本信即可聯絡
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject, html };
}
