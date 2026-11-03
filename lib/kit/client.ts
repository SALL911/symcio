/**
 * Kit (ConvertKit) API v4 client — subscribe an email to the list / a form.
 * Returns a {ok, status, error?} shape so callers can log without throwing.
 *
 * Env:
 *   KIT_API_KEY   — API key from Kit → Settings → Developer
 *   KIT_FORM_ID   — (optional) if set, subscribes to that specific form; else
 *                   creates a generic subscriber on the account.
 *
 * Docs: https://developers.kit.com/
 */

export function hasKitConfig(): boolean {
  return Boolean(process.env.KIT_API_KEY?.trim());
}

export async function subscribeToKit(email: string): Promise<{
  ok: boolean;
  status: number;
  error?: string;
}> {
  const apiKey = process.env.KIT_API_KEY?.trim();
  if (!apiKey) return { ok: false, status: 0, error: "kit-not-configured" };

  const formId = process.env.KIT_FORM_ID?.trim();
  const url = formId
    ? `https://api.kit.com/v4/forms/${encodeURIComponent(formId)}/subscribers`
    : "https://api.kit.com/v4/subscribers";

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({ email_address: email }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { ok: false, status: resp.status, error: body.slice(0, 300) };
    }
    return { ok: true, status: resp.status };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
