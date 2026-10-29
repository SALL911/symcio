/**
 * Obsidian 同步：把會員寫成一則 Markdown 筆記，commit 到「Obsidian vault 用的私有 GitHub repo」。
 * 本機 Obsidian 以 Obsidian Git 外掛定時 pull，即可在 vault 看到最新會員筆記。
 *
 * 需要：
 *   OBSIDIAN_VAULT_REPO   — "owner/repo"，必須是 private repo（筆記含個資）
 *   OBSIDIAN_VAULT_TOKEN  — fine-grained PAT，只授權該 repo 的 Contents: Read and write
 *   OBSIDIAN_VAULT_DIR    — 選填，預設 "Symcio/Members"
 *
 * 筆記只在首次建立；之後屬於使用者在 Obsidian 內手動維護的區域，同步不覆寫。
 */

import type { MemberRecord, SyncResult } from "./types";

const API = "https://api.github.com";

function slug(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9@._-]/g, "-").replace("@", "_at_");
}

const yaml = (v: string) => JSON.stringify(v);

export function renderMemberNote(m: MemberRecord): string {
  return `---
type: symcio-member
email: ${yaml(m.email.toLowerCase())}
name: ${yaml(m.name ?? "")}
company: ${yaml(m.company ?? "")}
source: ${yaml(m.source)}
plan: ${yaml(m.plan ?? "free")}
newsletter: ${m.newsletterOptIn ? "true" : "false"}
signed_up: ${yaml(m.createdAt)}
tags: [symcio/member, source/${m.source}]
---

# ${m.name || m.email}

- Email：${m.email.toLowerCase()}
- 公司：${m.company || "—"}
- 註冊來源：${m.source}
- 方案：${m.plan ?? "free"}
- 電子報：${m.newsletterOptIn ? "已訂閱" : "未訂閱"}

## 互動紀錄

<!-- 手動補充：會議、需求、報價。本筆記建立後不再被自動同步覆寫。 -->
`;
}

export async function syncToObsidian(m: MemberRecord): Promise<SyncResult> {
  const repo = process.env.OBSIDIAN_VAULT_REPO;
  const token = process.env.OBSIDIAN_VAULT_TOKEN;
  if (!repo || !token) return { target: "obsidian", status: "skipped", error: "obsidian-not-configured" };

  const dir = (process.env.OBSIDIAN_VAULT_DIR || "Symcio/Members").replace(/^\/+|\/+$/g, "");
  const path = `${dir}/${slug(m.email)}.md`;
  const url = `${API}/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
  const h = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const content = renderMemberNote(m);
    const encoded = Buffer.from(content, "utf8").toString("base64");

    const existing = await fetch(url, { headers: h });
    if (existing.ok) {
      const file = (await existing.json()) as { sha: string };
      return { target: "obsidian", status: "ok", externalId: file.sha };
    } else if (existing.status !== 404) {
      return { target: "obsidian", status: "failed", error: `get HTTP ${existing.status}` };
    }

    const put = await fetch(url, {
      method: "PUT",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `[member] ${slug(m.email)}`, content: encoded }),
    });
    const body = await put.text();
    if (!put.ok) return { target: "obsidian", status: "failed", error: `put HTTP ${put.status}: ${body.slice(0, 200)}` };
    return { target: "obsidian", status: "ok", externalId: (JSON.parse(body) as { content?: { sha?: string } }).content?.sha };
  } catch (err) {
    return { target: "obsidian", status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
