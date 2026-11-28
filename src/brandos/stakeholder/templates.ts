/**
 * 一次性 intro 信件骨架（冷接觸國際機構用）。
 * 每週摘要信見 src/render.ts。
 * 紅線：不得出現 博弈/投注、Brand Token/分潤、基金會背書金融商品。
 */

export interface IntroTemplate {
  segment: string;
  subject: string;
  /** {{name}} 收件機構, {{contact}} 聯絡人 */
  body: string;
}

export const INTRO_TEMPLATES: Record<string, IntroTemplate> = {
  standards: {
    segment: "標準制定",
    subject: "Stakeholder interest — SME data layer for EU DPP — Symcio (Taiwan, in formation)",
    body: [
      "Dear {{contact}},",
      "",
      "I'm Sall Huang, founder of Symcio, a venture in formation in Taiwan building a compliance data layer to help Asia-Pacific SMEs prepare for the EU Digital Product Passport (DPP).",
      "",
      "We build on W3C Verifiable Credentials and GS1 Digital Link, and would value being connected to the standards conversation early. Could Symcio register as a stakeholder / observer / adopter of {{name}}'s outputs?",
      "",
      "Kind regards,",
      "Sall Huang | Symcio 全識 (in formation) | sall@symcio.tw",
    ].join("\n"),
  },
  intl_org: {
    segment: "國際組織",
    subject: "Expression of interest — Symcio (Taiwan, in formation)",
    body: [
      "Dear {{contact}},",
      "",
      "I'm Sall Huang, founder of Symcio (in formation, Taiwan). We quantify brand value for SMEs by combining ISO 10668 brand valuation, TNFD nature disclosure and AI visibility into a Brand Capital Index.",
      "",
      "As a company in formation we'd like to understand the participation pathway with {{name}} and align our reporting from day one.",
      "",
      "With appreciation,",
      "Sall Huang | Symcio 全識 (in formation) | sall@symcio.tw",
    ].join("\n"),
  },
  finance: {
    segment: "金融/投資",
    subject: "Introducing Symcio — brand-capital infrastructure (Taiwan, in formation)",
    body: [
      "Dear {{contact}},",
      "",
      "I'm Sall Huang, founder of Symcio (in formation). We make brand value measurable for the Asia-Pacific mid-market using ISO 10668, TNFD and AI-visibility data.",
      "",
      "We'd welcome a short call to explore data collaboration / methodology alignment with {{name}}.",
      "",
      "Best regards,",
      "Sall Huang | Symcio 全識 (in formation) | sall@symcio.tw",
    ].join("\n"),
  },
  partner: {
    segment: "產業合作",
    subject: "Symcio 合作邀請（籌備中）",
    body: [
      "{{contact}} 您好，",
      "",
      "我是黃智詮（Sall），Symcio 全識創辦人（公司籌備中）。我們用 AI 量化品牌價值，結合 ISO 10668、TNFD 與 AI 可見度，協助台灣中小企業因應 2027 起的歐盟 DPP 合規。",
      "",
      "想邀請 {{name}} 一起探討合作的可能。若方便，安排一次簡短對齊。",
      "",
      "順頌時祺",
      "黃智詮 Sall | Symcio 全識（籌備中）| sall@symcio.tw",
    ].join("\n"),
  },
};
