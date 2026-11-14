/**
 * 會員資料 fan-out：HubSpot（CRM SSoT）+ Notion（人類協作）+ Obsidian（個人知識庫）。
 *
 * 三個目標彼此獨立、各自降級；任一失敗不影響其他，也不阻斷登入 / 訂閱流程。
 * 每次結果寫入 Supabase member_sync_log，供每日補同步 cron 重試。
 */

import { adminClient } from "@/lib/supabase/admin";
import { syncToHubSpot } from "./hubspot";
import { syncToNotion } from "./notion";
import { syncToObsidian } from "./obsidian";
import type { MemberRecord, SyncResult, SyncTarget } from "./types";

const RUNNERS: Record<SyncTarget, (m: MemberRecord) => Promise<SyncResult>> = {
  hubspot: syncToHubSpot,
  notion: syncToNotion,
  obsidian: syncToObsidian,
};

export async function syncMember(
  m: MemberRecord,
  targets: SyncTarget[] = ["hubspot", "notion", "obsidian"],
): Promise<SyncResult[]> {
  const settled = await Promise.allSettled(targets.map((t) => RUNNERS[t](m)));
  const results: SyncResult[] = settled.map((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : { target: targets[i], status: "failed", error: String(s.reason) },
  );

  const sb = adminClient();
  if (sb) {
    const { error } = await sb.from("member_sync_log").insert(
      results.map((r) => ({
        email: m.email.toLowerCase(),
        member_id: m.supabaseId ?? null,
        target: r.target,
        status: r.status,
        external_id: r.externalId ?? null,
        error: r.error ?? null,
      })),
    );
    if (error) console.warn("[sync] member_sync_log insert failed:", error.message);

    // 三個目標都不是 failed 才標記完成；skipped 視為完成（該目標未啟用）
    if (m.supabaseId && results.every((r) => r.status !== "failed")) {
      await sb
        .from("members")
        .update({ crm_synced_at: new Date().toISOString() })
        .eq("id", m.supabaseId);
    }
  }

  const failed = results.filter((r) => r.status === "failed");
  if (failed.length) console.warn("[sync] failures for %s: %o", m.email, failed);
  return results;
}
