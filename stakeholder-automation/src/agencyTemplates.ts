/**
 * 媒體代理商 / 產業公會外聯信件模板。
 *
 * 紅線（與 templates.ts 一致，不可繞過）：
 * - 不得出現 博弈/投注/賠率
 * - 不得出現 Brand Token / 成長份額 / 分潤型代幣
 * - 不得以基金會背書金融商品
 * - 不得自稱 Bloomberg 代理商（正確說法：Bloomberg 數據應用顧問夥伴）
 *
 * NGO / 商業分流（見 BrandOS-Infrastructure docs/NGO_ENTITY_STRUCTURE.md §2.2）：
 * - 聯合會名義的信只談標準制定、委員會、研究合作
 * - 任何商業服務、報價、採購一律以 Symcio 名義另行往來
 */

export interface Agency {
  name: string;
  nameEn: string;
  domain: string;
  phone: string;
  email: string;
  orgType: string;
  countyCity: string;
  stage: string;
  sourceNode: string;
  language: "zh" | "en";
  /** 個人化段落。空字串會在草稿裡留下 TODO 標記，提醒補齊後才可寄出。 */
  personalNote: string;
  notes: string;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  /** personalNote 未填時為 true — 這類草稿不得直接寄出。 */
  needsPersonalization: boolean;
}

const SIGNATURE = [
  "順頌時祺",
  "黃智詮 Sall ｜ Symcio 全識（籌備中）",
  "sall@symcio.tw ｜ https://symcio.tw",
].join("\n");

function header(a: Agency, needsPersonalization: boolean): string {
  const target = a.email?.trim()
    ? a.email
    : "（此單位無公開 email — 草稿先存為備份，請補上聯絡窗口再寄）";
  const lines = [
    "─────────────────────────────────────",
    "⚠️ 草稿備份，審閱後手動寄出。",
    "建議寄件帳號：sall@symcio.tw",
    `實際收件人：${target}`,
    `備份副本（Bcc）：sall@symcio.tw`,
  ];
  if (needsPersonalization) {
    lines.push(
      "🔴 TODO：personalNote 尚未填寫。依 cold-outreach 規範，",
      "   主旨與前兩句必須提到對方具體近況，補齊前不得寄出。",
    );
  }
  lines.push("─────────────────────────────────────", "");
  return lines.join("\n");
}

/** 產業公會（MAA）— 談委員會與標準，不談商業服務。 */
function renderAssociation(a: Agency): RenderedEmail {
  const needs = !a.personalNote.trim();
  const personal = a.personalNote.trim() || "【待補：貴會近期的活動、白皮書或產業倡議】";
  const subject = `關於 AI 可見度量化標準 — 想請教 ${a.name} 的看法`;
  const text = [
    header(a, needs),
    `${a.name} 秘書處 您好，`,
    "",
    "我是黃智詮（Sall），Symcio 全識創辦人，同時參與全國區塊鏈會計聯合會的標準工作。",
    "",
    personal,
    "",
    "想請教一個貴會會員普遍會遇到的量化缺口：",
    "當廣告主問「我的品牌在 ChatGPT、Gemini 裡有沒有被推薦」時，",
    "現行的媒體成效報告裡沒有欄位能回答。",
    "",
    "我們把這件事量化成跨四引擎（ChatGPT / Claude / Gemini / Perplexity）的每日監測指標。",
    "聯合會這邊正在籌設「媒體與永續數據委員會」，希望把 AI 可見度的量測方法",
    "整理成一份產業可共用的參考標準——這是公協會層級的工作，不是採購案。",
    "",
    "想邀請貴會以產業公會身份參與方法論討論。",
    "若方便，安排一次 20 分鐘的線上說明即可，不需要任何承諾。",
    "",
    SIGNATURE,
    "",
    "如不希望再收到相關訊息，回覆「STOP」即可。",
  ].join("\n");
  return { subject, text, needsPersonalization: needs };
}

/** 媒體代理商 — 資料層合作，明確劃清不做代理商的顧問業務。 */
function renderMediaAgency(a: Agency): RenderedEmail {
  const needs = !a.personalNote.trim();
  const personal = a.personalNote.trim() || "【待補：對方近期的案子、得獎、發表或人事異動】";
  const label = a.nameEn ? `${a.name}（${a.nameEn}）` : a.name;
  const subject = `給 ${a.nameEn || a.name} 一個 AI 可見度的資料層選項`;
  const text = [
    header(a, needs),
    `${label} 承辦窗口 您好，`,
    "",
    "我是黃智詮（Sall），Symcio 全識創辦人。",
    "",
    personal,
    "",
    "貴公司替客戶做媒體成效與品牌健康度分析時，應該已經注意到一個新的量化缺口：",
    "",
    "  客戶問「我的品牌在 ChatGPT / Gemini 裡是不是被推薦？」時，",
    "  既有的媒體監測方法論裡沒有欄位能回答。",
    "",
    "Symcio 是台灣第一個把這件事量化起來的平台——跨 ChatGPT / Claude / Gemini /",
    "Perplexity 四引擎的每日 benchmarking，輸出可直接接進貴公司既有報告的 JSON / PDF。",
    "",
    "先說清楚：我們不做媒體企劃、不做投放、不碰你們的客戶關係。",
    "我們只提供資料層，刻意不進入代理商的業務範圍。",
    "",
    "三個可以談的合作模式：",
    "",
    "1. 資料授權 — 貴公司採購四引擎可見度數據，插進給客戶的成效報告，",
    "   AI 可見度成為既有指標之外的新軸線",
    "2. 白牌稽核 — 以貴公司品牌出具 AI 可見度稽核報告，Symcio 在幕後",
    "3. 轉介 — 貴公司推薦客戶，我們給 revenue share",
    "",
    "下週二或週四 30 分鐘，我帶方法論與合作選項走一次？",
    "",
    SIGNATURE,
    "",
    "如不希望再收到相關訊息，回覆「STOP」即可。",
  ].join("\n");
  return { subject, text, needsPersonalization: needs };
}

export function renderAgencyEmail(a: Agency): RenderedEmail {
  return a.orgType === "trade_association"
    ? renderAssociation(a)
    : renderMediaAgency(a);
}
