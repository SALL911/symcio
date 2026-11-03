/**
 * PayPal REST (Orders v2) client — create + capture orders.
 * Returns null config when env is missing so callers can degrade gracefully.
 *
 * TWD is a no-decimal PayPal currency, so amounts are whole-dollar strings.
 */

export interface PaypalConfig {
  clientId: string;
  secret: string;
  base: string;
}

export const PAYPAL_PRODUCTS = {
  ebook: { name: "BCI 品牌資本指數方法論電子書", value: "390", currency: "TWD" },
} as const;

export type PaypalProduct = keyof typeof PAYPAL_PRODUCTS;

export function getPaypalConfig(): PaypalConfig | null {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) return null;
  const base =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  return { clientId, secret, base };
}

async function accessToken(cfg: PaypalConfig): Promise<string> {
  const auth = Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString("base64");
  const resp = await fetch(`${cfg.base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) throw new Error(`paypal-oauth HTTP ${resp.status}`);
  const data = (await resp.json()) as { access_token: string };
  return data.access_token;
}

export async function createOrder(opts: {
  config: PaypalConfig;
  product: PaypalProduct;
  origin: string;
}): Promise<{ approveUrl: string | null; error?: string }> {
  const item = PAYPAL_PRODUCTS[opts.product];
  try {
    const token = await accessToken(opts.config);
    const resp = await fetch(`${opts.config.base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: opts.product,
            description: item.name,
            amount: { currency_code: item.currency, value: item.value },
          },
        ],
        application_context: {
          brand_name: "Symcio",
          user_action: "PAY_NOW",
          return_url: `${opts.origin}/api/paypal/capture?product=${opts.product}`,
          cancel_url: `${opts.origin}/checkout/cancel`,
        },
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { approveUrl: null, error: `paypal-create HTTP ${resp.status}: ${body.slice(0, 200)}` };
    }
    const data = (await resp.json()) as { links?: Array<{ rel: string; href: string }> };
    const approve = data.links?.find((l) => l.rel === "approve")?.href ?? null;
    return { approveUrl: approve };
  } catch (err) {
    return { approveUrl: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function captureOrder(
  cfg: PaypalConfig,
  orderId: string,
): Promise<{ completed: boolean; email?: string; product?: string; error?: string }> {
  try {
    const token = await accessToken(cfg);
    const resp = await fetch(`${cfg.base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!resp.ok) {
      const body = await resp.text();
      return { completed: false, error: `paypal-capture HTTP ${resp.status}: ${body.slice(0, 200)}` };
    }
    const data = (await resp.json()) as {
      status?: string;
      payer?: { email_address?: string };
      purchase_units?: Array<{ payments?: { captures?: Array<{ custom_id?: string }> } }>;
    };
    const custom = data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
    return {
      completed: data.status === "COMPLETED",
      email: data.payer?.email_address,
      product: custom,
    };
  } catch (err) {
    return { completed: false, error: err instanceof Error ? err.message : String(err) };
  }
}
