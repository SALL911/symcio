/** 會員 / 訂閱者同步到外部系統（HubSpot / Notion / Obsidian）的共用資料形狀。 */
export interface MemberRecord {
  email: string;
  name?: string | null;
  company?: string | null;
  title?: string | null;
  /** signup / google / newsletter / line / import */
  source: string;
  plan?: string | null;
  supabaseId?: string | null;
  /** ISO timestamp */
  createdAt: string;
}

export type SyncTarget = "hubspot" | "notion" | "obsidian";

export interface SyncResult {
  target: SyncTarget;
  /** ok: 已寫入；skipped: 未設定環境變數；failed: API 錯誤 */
  status: "ok" | "skipped" | "failed";
  externalId?: string;
  error?: string;
}
