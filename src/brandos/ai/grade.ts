import { aiText } from "./model";

// 名單進件即時分級。規則先算出基準（一定有結果），AI 只負責補摘要與話術，
// 並可在規則基準上調整一級。AI 不可用時，規則結果加範本話術照樣可用。

export type Grade = "A" | "B" | "C";

export type LeadForGrading = {
  source: string;
  name: string;
  company: string;
  email: string;
  notes: string;
  utm_source?: string;
};

export type GradeResult = {
  grade: Grade;
  intent: string; // consult / pricing / diagnosis / info / unknown
  summary: string;
  script: string; // 內部用成交話術建議
  by: "ai" | "rules";
};

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|icloud|live|msn|proton|protonmail|qq|163|pchome|hinet)\./i;
const BUY_WORDS = /(報價|預算|費用|價格|多少錢|方案|合約|導入|時程|採購|簽約|POC|試行|pricing|quote|budget)/i;
const SIZE_BIG = /company_size=(?!1-|1~|<|個人|微型)[^;]*(50|100|200|500|1000|以上)/i;

export function gradeByRules(lead: LeadForGrading): { grade: Grade; intent: string; points: number } {
  let points = 0;
  if (!FREE_MAIL.test(lead.email)) points += 30; // 公司信箱
  if (lead.source === "service-form") points += 25; // 主動約諮詢
  if (BUY_WORDS.test(lead.notes)) points += 25; // 提到預算 / 報價 / 導入
  const need = lead.notes.replace(/^need=/, "");
  if (need.length >= 30 && !/未填/.test(need)) points += 10; // 有具體描述
  if (SIZE_BIG.test(lead.notes)) points += 10;
  if (lead.utm_source) points += 5; // 來自投放，成本已發生，優先處理

  const grade: Grade = points >= 60 ? "A" : points >= 30 ? "B" : "C";
  const intent = BUY_WORDS.test(lead.notes)
    ? "pricing"
    : lead.source === "service-form"
      ? "consult"
      : lead.source === "audit-form"
        ? "diagnosis"
        : "info";
  return { grade, intent, points };
}

function templateScript(lead: LeadForGrading, grade: Grade): string {
  const who = lead.company || lead.name;
  if (grade === "A") {
    return [
      `1. 一個工作天內回信或致電，開場直接回應對方寫的問題，不講公司介紹。`,
      `2. 提議先為「${who}」跑一份免費 AIVI Baseline（3 個工作天、列出 3 個缺口），用成品開啟對話。`,
      `3. Baseline 交付時再提 90 天 POC（NTD 30,000）；報價前先確認開票主體。`,
      `4. 只談量測與缺口，不承諾排名或營收提升；優化執行轉介合作夥伴。`,
    ].join("\n");
  }
  if (grade === "B") {
    return [
      `1. 回信確認收到，問一個問題：「目前最想讓 AI 在哪一類問題提到 ${who}？」`,
      `2. 附上免費診斷連結，請對方先看自己的結果。`,
      `3. 有回覆再提議免費 Baseline，沒回覆就交給跟進信。`,
    ].join("\n");
  }
  return [
    `1. 不需人工跟進，交給自動確認信與免費診斷連結。`,
    `2. 若對方回信提到預算或時程，再升級為人工處理。`,
  ].join("\n");
}

const SYSTEM = `你是 Symcio 的業務助理，替內部業務人員整理新名單。只輸出 JSON，不要 markdown。
Symcio 做的事：量測品牌在 ChatGPT / Gemini / Perplexity / Claude 的可見度，只量測、不代做優化。
商業流程：免費 AIVI Baseline（3 個工作天、3 個缺口）→ 90 天 POC NTD 30,000 → 月訂閱。
話術規則：不承諾排名、營收或估值提升；不說第一、唯一；不宣稱與任何公司合作；語氣專業、簡短、繁體中文。
JSON 格式：{"grade":"A|B|C","intent":"consult|pricing|diagnosis|info|unknown","summary":"一句話描述這筆名單","script":"3 到 4 行的下一步話術，每行以數字開頭"}`;

export async function gradeLead(lead: LeadForGrading): Promise<GradeResult> {
  const base = gradeByRules(lead);
  const fallback: GradeResult = {
    grade: base.grade,
    intent: base.intent,
    summary: `${lead.company || lead.name}，來源 ${lead.source}，規則分數 ${base.points}。`,
    script: templateScript(lead, base.grade),
    by: "rules",
  };

  const raw = await aiText({
    system: SYSTEM,
    prompt: [
      `來源表單：${lead.source}`,
      `公司：${lead.company}`,
      `Email 網域：${lead.email.split("@")[1] || ""}`,
      `內容：${lead.notes.slice(0, 800)}`,
      `規則基準分級：${base.grade}（你最多只能調整一級）`,
    ].join("\n"),
    timeoutMs: 5000,
  });
  if (!raw) return fallback;

  try {
    const json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")) as Partial<GradeResult>;
    const order: Grade[] = ["A", "B", "C"];
    let grade = order.includes(json.grade as Grade) ? (json.grade as Grade) : base.grade;
    // AI 最多調整一級，避免單次幻覺把低意圖名單推成 A
    if (Math.abs(order.indexOf(grade) - order.indexOf(base.grade)) > 1) grade = base.grade;
    const script = typeof json.script === "string" && json.script.trim().length > 10 ? json.script.trim() : fallback.script;
    return {
      grade,
      intent: typeof json.intent === "string" ? json.intent.slice(0, 50) : base.intent,
      summary: typeof json.summary === "string" && json.summary.trim() ? json.summary.trim().slice(0, 300) : fallback.summary,
      script: script.slice(0, 1200),
      by: "ai",
    };
  } catch {
    return fallback;
  }
}
