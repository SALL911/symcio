// 跟進信範本。固定文案（非 AI 產生），已依紅線自檢：不承諾成效、不做排名宣稱。
// d0 是交易性確認信，一律寄；d2 / d5 只有 FOLLOWUP_SEQUENCE_ENABLED=true 才會排程。

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

export type FollowupStep = "d0" | "d2" | "d5";
export const SEQUENCE_STEPS: { step: FollowupStep; afterDays: number }[] = [
  { step: "d2", afterDays: 2 },
  { step: "d5", afterDays: 5 },
];

function esc(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shell(body: string, unsubscribeUrl?: string): string {
  const footer = unsubscribeUrl
    ? `<p style="font-size:12px;color:#6B7B6F;margin-top:32px;">你會收到這封信，是因為你在 symcio.tw 留下了聯絡方式。不想再收到後續信件，請點<a href="${esc(unsubscribeUrl)}" style="color:#6B7B6F;">取消訂閱</a>。</p>`
    : `<p style="font-size:12px;color:#6B7B6F;margin-top:32px;">這是一封確認信，回覆這封信即可與我們聯絡。</p>`;
  return `<!DOCTYPE html><html lang="zh-Hant"><body style="font-family:-apple-system,Segoe UI,Noto Sans TC,sans-serif;color:#1A2E22;line-height:1.7;max-width:560px;margin:0 auto;padding:24px;">
${body}
<p style="margin-top:24px;">Symcio 團隊<br><a href="${SITE}" style="color:#2A4D3A;">symcio.tw</a></p>
${footer}
</body></html>`;
}

function button(label: string, href: string): string {
  return `<p><a href="${esc(href)}" style="display:inline-block;background:#2A4D3A;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;">${esc(label)}</a></p>`;
}

export function renderFollowup(
  step: FollowupStep,
  p: { name: string; company: string; unsubscribeUrl?: string },
): { subject: string; html: string } {
  const hi = `<p>${esc(p.name || "你好")}，你好：</p>`;
  const brand = esc(p.company || "你的品牌");

  if (step === "d0") {
    return {
      subject: "已收到你的諮詢需求 — Symcio",
      html: shell(
        `${hi}
<p>我們已收到你為「${brand}」留下的諮詢需求，會在 1 個工作天內由專人以 email 回覆。</p>
<p>等待期間，你可以先做 3 分鐘的免費診斷，看看 ChatGPT、Gemini、Perplexity、Claude 目前怎麼描述你的品牌。</p>
${button("開始免費診斷", `${SITE}/audit?utm_source=email&utm_medium=followup&utm_campaign=d0`)}`,
      ),
    };
  }
  if (step === "d2") {
    return {
      subject: `AI 引擎現在怎麼介紹「${p.company || "你的品牌"}」？`,
      html: shell(
        `${hi}
<p>前兩天你在 Symcio 留下了諮詢需求。多數品牌初次看到自己的 AI 可見度結果時，最常發現的是這三種缺口：</p>
<ol>
<li>AI 回答同類問題時，提到的是競品而不是自己。</li>
<li>AI 有提到品牌，但描述是舊資料或不完整。</li>
<li>AI 引用的來源不是品牌自己能控制的頁面。</li>
</ol>
<p>免費診斷會告訴你「${brand}」目前屬於哪一種。結果只是量測，不含任何成效承諾。</p>
${button("查看我的品牌結果", `${SITE}/audit?utm_source=email&utm_medium=followup&utm_campaign=d2`)}`,
        p.unsubscribeUrl,
      ),
    };
  }
  return {
    subject: "需要一份完整的 AI 可見度基準報告嗎？",
    html: shell(
      `${hi}
<p>如果你想要比免費診斷更完整的資料，我們可以為「${brand}」製作一份 AIVI Baseline：3 個工作天交付，列出 3 個最需要補的缺口，不收費。</p>
<p>有興趣的話，直接回覆這封信，告訴我們想量測的品牌名稱與主要競品即可。</p>
<p>這是這個系列的最後一封信，之後不會再主動寄送。</p>`,
      p.unsubscribeUrl,
    ),
  };
}
