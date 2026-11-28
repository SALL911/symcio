"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { leadsSupabase } from "@/lib/leads/capture";
import { LEAD_STATUSES } from "@/lib/admin/statuses";


const StatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES),
});

export async function updateLeadStatus(formData: FormData): Promise<void> {
  assertAdmin();
  const input = StatusInput.parse({ id: formData.get("id"), status: formData.get("status") });
  const sb = leadsSupabase();
  if (!sb) throw new Error("supabase-not-configured");
  const { error } = await sb
    .from("leads")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads");
}

const SpendInput = z.object({
  spend_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  channel: z.string().trim().min(1).max(40),
  campaign: z.string().trim().max(255),
  amount_twd: z.coerce.number().min(0).max(100_000_000),
});

/** 新增或覆寫某日某通路某活動的廣告花費（同一組鍵重複輸入視為更正）。 */
export async function saveAdSpend(formData: FormData): Promise<void> {
  assertAdmin();
  const input = SpendInput.parse({
    spend_date: formData.get("spend_date"),
    channel: formData.get("channel") || "meta",
    campaign: formData.get("campaign") || "",
    amount_twd: formData.get("amount_twd"),
  });
  const sb = leadsSupabase();
  if (!sb) throw new Error("supabase-not-configured");
  const { error } = await sb.from("ad_spend").upsert(input, { onConflict: "spend_date,channel,campaign" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
