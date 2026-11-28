/**
 * L2 · Compliance Pre-Audit endpoint.
 *
 * POST { company_name, category, markets[], email, display_name?, role? }
 *  → 1-page exposure report (EU ESPR/DPP/CSRD, US SEC Climate, APAC IFRS S1S2/TNFD)
 *  → captureLead (source='compliance-audit', notes=structured JSON)
 *  → email full report via Resend (graceful no-op if missing)
 *  → return report markdown to render inline
 *
 * Lead enters Notion CRM via existing Composio leads-sync cron.
 *
 * Defensive: top-level try/catch ensures JSON response on any throw path.
 * Graceful degrade: works without Anthropic env (returns canned framework
 * skeleton instead of AI-generated). Always captures the lead.
 */

import { NextResponse, type NextRequest } from "next/server";
import { captureLead, type LeadAttribution } from "@/lib/leads/capture";
import { send as sendEmail } from "@/brandos/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface AuditInput {
  company_name?: string;
  category?: string;
  markets?: string[];
  email?: string;
  display_name?: string;
  role?: string;
  attribution?: LeadAttribution;
  meta_event_id?: string;
}

interface AuditReport {
  generated_at: string;
  company: string;
  category: string;
  markets: string[];
  exposure_summary: string;
  framework_mapping: Array<{
    framework: string;
    relevance: "high" | "medium" | "low" | "n/a";
    note: string;
  }>;
  three_actions: Array<{ priority: 1 | 2 | 3; action: string; reason: string }>;
  disclaimer: string;
}

const VALID_MARKETS = new Set(["EU", "US", "APAC", "TW", "JP", "KR", "SG", "UK"]);
const VALID_CATEGORIES = new Set([
  "consumer-electronics",
  "textile-apparel",
  "food-beverage",
  "cosmetics-personal-care",
  "industrial-manufacturing",
  "b2b-saas",
  "financial-services",
  "healthcare-biotech",
  "retail-ecommerce",
  "other",
]);

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const SYSTEM_PROMPT = `你是 Symcio BrandOS 的合規曝險分析師。根據訪客提供的公司名、品類、目標市場,在 1 頁內輸出可操作的合規曝險評估。

輸出嚴格符合以下 JSON schema:
{
  "exposure_summary": "150 字內,描述該品類在指定市場的主要合規曝險。具體、無空話。",
  "framework_mapping": [
    {"framework": "EU ESPR / DPP", "relevance": "high|medium|low|n/a", "note": "60 字內具體說明對此公司的影響"},
    {"framework": "EU CSRD / ESRS", "relevance": "...", "note": "..."},
    {"framework": "EU PPWR", "relevance": "...", "note": "..."},
    {"framework": "US SEC Climate", "relevance": "...", "note": "..."},
    {"framework": "IFRS S1 / S2 (APAC)", "relevance": "...", "note": "..."},
    {"framework": "TNFD", "relevance": "...", "note": "..."}
  ],
  "three_actions": [
    {"priority": 1, "action": "30 字內具體動作", "reason": "60 字內為什麼"},
    {"priority": 2, ...},
    {"priority": 3, ...}
  ]
}

風格:
- 寫給 CMO / 永續長 / IR 看,不要寫給律師看
- 避免「重大」「關鍵」「全面」這類空詞,直接給數字、時程、frameworks 名稱
- 不要寫 disclaimer(系統會自動加)
- 不保證任何結果,只列觀察的合規 deadline 與所需準備工作`;

async function generateReport(
  company: string,
  category: string,
  markets: string[],
): Promise<{
  exposure_summary: string;
  framework_mapping: AuditReport["framework_mapping"];
  three_actions: AuditReport["three_actions"];
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback skeleton when AI not configured — still useful as framework
    // checklist so the user gets something on screen.
    return {
      exposure_summary: `${company}(${category})在 ${markets.join("、")} 市場可能受多項永續法規影響。完整分析需 AI 啟用後重跑;以下為框架對照。`,
      framework_mapping: [
        { framework: "EU ESPR / DPP", relevance: markets.includes("EU") ? "high" : "n/a", note: "若銷往歐盟,2026 Q2 起電池、紡織等品類強制揭露數位產品護照" },
        { framework: "EU CSRD / ESRS", relevance: markets.includes("EU") ? "high" : "low", note: "EU 上市公司 2026 起全面適用;一階供應商會被連動要求" },
        { framework: "EU PPWR", relevance: markets.includes("EU") ? "medium" : "n/a", note: "包裝廢棄物法規,影響消費品與電商品類" },
        { framework: "US SEC Climate", relevance: markets.includes("US") ? "medium" : "n/a", note: "適用在美上市公司,範疇 1/2 強制揭露" },
        { framework: "IFRS S1 / S2 (APAC)", relevance: "medium", note: "香港、新加坡、日本 2026 強制;台灣 2027 起接軌" },
        { framework: "TNFD", relevance: "low", note: "目前自願,但金融業 2026 已開始要求授信端揭露自然依賴" },
      ],
      three_actions: [
        { priority: 1, action: "盤點目前向 EU/US/APAC 出口的產品數量與營收占比", reason: "決定優先實作哪幾套揭露框架" },
        { priority: 2, action: "與會計師確認哪些 framework 你的母集團已強制揭露", reason: "如果母集團已揭露,你只需提供子層次資料,工作量大幅減少" },
        { priority: 3, action: "建立 Wikidata + Schema.org 結構化資料公開頁", reason: "AI 引擎在「該品牌永續性」query 抓得到結構化資料,可拉高 V 軸品牌可見度" },
      ],
    };
  }

  const userMsg = `公司:${company}\n品類:${category}\n目標市場:${markets.join("、")}\n\n依 SYSTEM 規範輸出 JSON。`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!resp.ok) {
    throw new Error(`anthropic HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }

  const data = (await resp.json()) as {
    content?: Array<{ text?: string }>;
  };
  const text = data.content?.[0]?.text ?? "";

  // Tolerate Claude wrapping JSON in prose / code fences
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("anthropic response missing JSON block");

  const parsed = JSON.parse(jsonMatch[0]) as ReturnType<
    typeof generateReport
  > extends Promise<infer T>
    ? T
    : never;

  return parsed;
}

function renderEmailHtml(report: AuditReport): string {
  const fm = report.framework_mapping
    .map((f) => {
      const color = f.relevance === "high" ? "#D14848" : f.relevance === "medium" ? "#D99A1F" : f.relevance === "low" ? "#3B7AD9" : "#94A29A";
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #E5E2D9;"><strong>${f.framework}</strong></td><td style="padding:8px 12px;border-bottom:1px solid #E5E2D9;color:${color};font-weight:600;">${f.relevance.toUpperCase()}</td><td style="padding:8px 12px;border-bottom:1px solid #E5E2D9;color:#4B5563;">${f.note}</td></tr>`;
    })
    .join("\n");
  const actions = report.three_actions
    .map(
      (a) =>
        `<li style="margin:12px 0;"><strong style="color:#2A4D3A;">${a.priority}. ${a.action}</strong><br><span style="color:#6B7B6F;font-size:13px;">${a.reason}</span></li>`,
    )
    .join("\n");

  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:32px 16px;background:#F7F6F3;font-family:'IBM Plex Sans','Noto Sans TC',sans-serif;color:#1A2E22;">
  <table width="640" cellpadding="0" cellspacing="0" border="0" align="center" style="background:#FFFFFF;border:1px solid #E5E2D9;border-radius:12px;">
    <tr><td style="padding:32px;">
      <p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#2A4D3A;">Symcio · Compliance Pre-Audit</p>
      <h1 style="margin:0 0 8px;font-size:22px;color:#1A2E22;">${report.company} · 合規曝險評估</h1>
      <p style="margin:0 0 24px;font-family:monospace;font-size:11px;color:#6B7B6F;">${report.category} · ${report.markets.join(" / ")} · ${report.generated_at.slice(0, 10)}</p>

      <h2 style="margin:24px 0 8px;font-size:14px;color:#2A4D3A;text-transform:uppercase;letter-spacing:1px;">曝險摘要</h2>
      <p style="margin:0 0 24px;line-height:1.7;color:#374151;">${report.exposure_summary}</p>

      <h2 style="margin:24px 0 8px;font-size:14px;color:#2A4D3A;text-transform:uppercase;letter-spacing:1px;">框架對照</h2>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E5E2D9;font-size:13px;">
        ${fm}
      </table>

      <h2 style="margin:24px 0 8px;font-size:14px;color:#2A4D3A;text-transform:uppercase;letter-spacing:1px;">優先 3 個 Action</h2>
      <ol style="padding-left:20px;margin:0;">${actions}</ol>

      <div style="margin-top:32px;padding:16px;border-left:4px solid #7A5C08;background:#FAFAF9;font-size:12px;color:#4B3D08;line-height:1.7;">
        <strong>免責聲明 · Disclaimer</strong><br>${report.disclaimer}
      </div>

      <p style="margin:32px 0 0;padding-top:24px;border-top:1px solid #E5E2D9;font-size:11px;color:#6B7B6F;">
        Symcio · BrandOS · AI 能見度的量化標準<br>
        若想討論完整實作方案,可<a href="https://www.symcio.tw/pricing" style="color:#2A4D3A;">查看方案</a>或回信至
        <a href="mailto:info@symcio.tw" style="color:#2A4D3A;">info@symcio.tw</a>
      </p>
    </td></tr>
  </table>
</body></html>`;
}

const DISCLAIMER =
  "本評估基於公開法規資料,以觀察性指標(Observational)為主,不構成法律意見、稅務意見或合規認證。實際適用請洽具備該轄區資格的律師或會計師。Symcio 不對任何依本評估所作之商業決策承擔責任。";

export async function POST(req: NextRequest) {
  try {
    let body: AuditInput;
    try {
      body = (await req.json()) as AuditInput;
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid-json" },
        { status: 400 },
      );
    }

    const company = (body.company_name ?? "").trim().slice(0, 200);
    const category = (body.category ?? "").trim();
    const markets = Array.isArray(body.markets)
      ? body.markets.filter((m) => VALID_MARKETS.has(m)).slice(0, 8)
      : [];
    const email = (body.email ?? "").trim().toLowerCase();
    const displayName = (body.display_name ?? "").trim().slice(0, 120) || null;
    const role = (body.role ?? "").trim().slice(0, 80) || null;

    if (!company || !category || !VALID_CATEGORIES.has(category) || markets.length === 0 || !isEmail(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid-input",
          message: "請填寫公司名、品類、至少 1 個目標市場、有效 email。",
        },
        { status: 400 },
      );
    }

    // Generate report (Claude or fallback skeleton)
    let core: Awaited<ReturnType<typeof generateReport>>;
    try {
      core = await generateReport(company, category, markets);
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: "ai-error",
          message:
            "報告生成失敗(可能是 Claude API 額度或網路問題)。請稍後再試。",
          detail: e instanceof Error ? e.message : String(e),
        },
        { status: 502 },
      );
    }

    const report: AuditReport = {
      generated_at: new Date().toISOString(),
      company,
      category,
      markets,
      ...core,
      disclaimer: DISCLAIMER,
    };

    // 名單走單一入口 captureLead：寫入 leads、AI 分級、即時通知信、Meta 事件。
    // confirm=false：本工具自己寄完整報告，不重複寄確認信。寫入失敗仍回傳報告。
    try {
      await captureLead(req, {
        source: "compliance-audit",
        name: displayName ?? company,
        company,
        email,
        notes: JSON.stringify({
          role,
          category,
          markets,
          report_summary: core.exposure_summary,
          generated_at: report.generated_at,
        }).slice(0, 4000),
        attribution: body.attribution,
        metaEventId: body.meta_event_id,
        metaContentName: "compliance_audit",
        confirm: false,
      });
    } catch (e) {
      console.error("[compliance-audit] lead capture failed", e);
    }

    // Email full report (graceful no-op if Resend not set)
    void sendEmail({
      from: process.env.RESEND_FROM_ADDRESS || "Symcio <info@symcio.tw>",
      to: email,
      subject: `${company} · Symcio Compliance Pre-Audit`,
      html: renderEmailHtml(report),
      replyTo: "info@symcio.tw",
    }).catch(() => {
      /* non-fatal */
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "internal-error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
