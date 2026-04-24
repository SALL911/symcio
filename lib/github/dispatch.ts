/**
 * Minimal GitHub repository_dispatch client.
 *
 * Why not @octokit/rest: 180kb dep for one POST. Fetch wrapper is 20 lines.
 */

const API = "https://api.github.com";

export interface DispatchConfig {
  token: string;
  owner: string;
  repo: string;
}

function readConfig(): DispatchConfig | null {
  const token = process.env.GH_DISPATCH_TOKEN;
  const repoSlug = process.env.GH_DISPATCH_REPO; // "SALL911/BrandOS-Infrastructure"
  if (!token || !repoSlug) return null;
  const [owner, repo] = repoSlug.split("/");
  if (!owner || !repo) return null;
  return { token, owner, repo };
}

export async function fireRepositoryDispatch(params: {
  eventType: string;
  clientPayload: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = readConfig();
  if (!cfg) return { ok: false, error: "dispatch-not-configured" };

  try {
    const resp = await fetch(
      `${API}/repos/${cfg.owner}/${cfg.repo}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: params.eventType,
          client_payload: params.clientPayload,
        }),
      },
    );
    if (!resp.ok) {
      const text = await resp.text();
      return { ok: false, error: `github HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
