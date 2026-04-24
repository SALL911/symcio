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
        Symcio · Bloomberg 台灣授權代表 · <a href="https://symcio.tw" style="color:#6B7280;">symcio.tw</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject, html };
}
