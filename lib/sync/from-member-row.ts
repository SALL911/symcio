import type { MemberRecord } from "./types";

export interface MemberRow {
  id: string;
  email: string | null;
  display_name: string | null;
  company_name: string | null;
  title: string | null;
  plan: string | null;
  signup_source: string | null;
  created_at: string;
}

export const MEMBER_COLUMNS =
  "id, email, display_name, company_name, title, plan, signup_source, created_at";

export function toMemberRecord(r: MemberRow): MemberRecord | null {
  if (!r.email) return null;
  return {
    email: r.email,
    name: r.display_name,
    company: r.company_name,
    title: r.title,
    plan: r.plan,
    source: r.signup_source || "signup",
    supabaseId: r.id,
    createdAt: r.created_at,
  };
}
