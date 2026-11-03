// Shared auto-reply copy for the social messaging funnels (LINE / Telegram / Meta).
// Keeps the acquisition message consistent: free BCI scan + ebook upsell.

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

export function welcomeText(): string {
  return [
    "歡迎來到 Symcio 👋 我們幫品牌看見並提升在 AI 引擎（ChatGPT / Gemini / Perplexity / Claude）的可見度。",
    "",
    `1️⃣ 免費 BCI 快速診斷：${SITE}/audit`,
    `2️⃣ BCI 方法論電子書（NT$390，立即下載）：${SITE}/ebook`,
    "",
    "想了解哪一個？直接回我訊息就好 🙌",
  ].join("\n");
}

export function replyForText(_userText: string): string {
  // Template-based for reliability; an AI model can be layered on later via the
  // existing @ai-sdk/google dependency without changing the webhook contract.
  return welcomeText();
}

// Call-to-action links shared across channels that support buttons.
export function ctaButtons(): { text: string; url: string }[] {
  return [
    { text: "免費 BCI 診斷", url: `${SITE}/audit` },
    { text: "購買電子書 NT$390", url: `${SITE}/ebook` },
  ];
}
