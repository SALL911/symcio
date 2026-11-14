/**
 * Symcio LINE 官方帳號自動回覆內容。改文案只需改這個檔。
 * 關鍵字比對採「包含」，依序比對，第一個命中即回覆。
 */

import type { LineMessage, QuickReplyItem } from "./client";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://symcio.tw";

const QUICK: QuickReplyItem[] = [
  { type: "action", action: { type: "message", label: "免費 AI 能見度健檢", text: "健檢" } },
  { type: "action", action: { type: "message", label: "方案與價格", text: "價格" } },
  { type: "action", action: { type: "message", label: "訂閱雙週刊", text: "電子報" } },
  { type: "action", action: { type: "message", label: "找真人顧問", text: "真人" } },
];

const text = (t: string): LineMessage => ({ type: "text", text: t, quickReply: { items: QUICK } });

export function welcome(displayName?: string): LineMessage[] {
  return [
    text(
      `${displayName ? `${displayName} 您好，` : "您好，"}歡迎加入 Symcio。\n\n` +
        "Symcio 量化品牌在 ChatGPT、Claude、Gemini、Perplexity 四個 AI 引擎中的曝光與排名。\n\n" +
        "請點下方選項，或直接輸入問題。",
    ),
  ];
}

const RULES: { keywords: string[]; reply: () => LineMessage[] }[] = [
  {
    keywords: ["健檢", "診斷", "audit", "掃描", "免費"],
    reply: () => [text(`3 分鐘看見 AI 怎麼描述你的品牌：\n${SITE}/audit?utm_source=line&utm_medium=oa`)],
  },
  {
    keywords: ["價格", "方案", "費用", "報價", "price"],
    reply: () => [text(`方案與定價：\n${SITE}/pricing?utm_source=line&utm_medium=oa\n\n需要客製報價，請輸入「真人」。`)],
  },
  {
    keywords: ["電子報", "週報", "newsletter", "訂閱"],
    reply: () => [text(`品牌治理雙週刊，隔週二 09:00 寄出：\n${SITE}/subscribe?utm_source=line&utm_medium=oa`)],
  },
  {
    keywords: ["會員", "註冊", "登入", "login"],
    reply: () => [text(`會員註冊 / 登入：\n${SITE}/signup?utm_source=line&utm_medium=oa`)],
  },
  {
    keywords: ["真人", "顧問", "客服", "聯絡", "合作"],
    reply: () => [
      text(
        "已通知 Symcio 顧問，將於 1 個工作天內在此回覆。\n\n也可來信 sall@symcio.tw，並附上公司名稱與需求。",
      ),
    ],
  },
];

export function replyFor(input: string): LineMessage[] {
  const q = input.toLowerCase();
  const rule = RULES.find((r) => r.keywords.some((k) => q.includes(k.toLowerCase())));
  return rule ? rule.reply() : [text("收到。請點下方選項，或輸入「真人」由顧問回覆。")];
}

/** 是否需要轉真人（寫入 handoff 標記，供後台追蹤）。 */
export function wantsHuman(input: string): boolean {
  return ["真人", "顧問", "客服", "聯絡", "合作"].some((k) => input.includes(k));
}
