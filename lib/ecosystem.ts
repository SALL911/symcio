/**
 * Ecosystem / standards alignment registry for the /teams page.
 *
 * ⚠️ LOGO 使用原則：只有 status === "active"（已取得書面核准/接受）才能
 * 顯示官方 logo，且需遵守該機構的標誌使用規範（如 UN Global Compact
 * participant mark、TNFD Adopter badge）。status 為 "applied"/"planned" 時，
 * 網站只能顯示「申請中 / 標準對齊」文字，不得挂官方 logo（未核准即用=冒用）。
 *
 * 與 stakeholder-automation/stakeholders.json 與 Notion「關鍵利益人地圖」同步。
 */

export type EcosystemStatus = "active" | "applied" | "planned";

export interface EcosystemMember {
  name: string;
  region: "EU" | "SG" | "US" | "UN" | "TW";
  url: string;
  /** active = 已核准，可顯 logo；applied = 申請中；planned = 規劃中 */
  status: EcosystemStatus;
  /** 選用：核准後放官方 logo 路徑（需符合其品牌規範） */
  logo?: string;
  note?: string;
}

/**
 * 本週 0 成本優先 5 個。全部預設 "applied"；收到核准信後才改為 "active"
 * 並補上 logo，/teams 會自動顯示。
 */
export const ECOSYSTEM: EcosystemMember[] = [
  { name: "UN Global Compact", region: "UN", url: "https://unglobalcompact.org", status: "applied" },
  { name: "TNFD Adopter", region: "UN", url: "https://tnfd.global", status: "applied" },
  { name: "GS1 Taiwan", region: "EU", url: "https://www.gs1tw.org", status: "applied" },
  { name: "CIRPASS-2 (EU DPP)", region: "EU", url: "https://cirpassproject.eu", status: "applied" },
  { name: "MAS Project Greenprint (via ESGpedia)", region: "SG", url: "https://www.mas.gov.sg/schemes-and-initiatives/project-greenprint", status: "applied" },
];

export const activeMembers = (): EcosystemMember[] =>
  ECOSYSTEM.filter((m) => m.status === "active");

export const appliedMembers = (): EcosystemMember[] =>
  ECOSYSTEM.filter((m) => m.status === "applied");
