import crypto from "crypto";

/**
 * 綠界 ECPay AIO (全方位金流) client.
 *
 * Taiwan payment gateway — lets buyers pay in TWD via credit card, ATM,
 * convenience-store code, etc. Returns null config when env is missing so
 * callers can degrade gracefully (same pattern as the Stripe client).
 *
 * CheckMacValue follows the ECPay spec: sort params by key (case-insensitive),
 * wrap with HashKey/HashIV, URL-encode .NET-style, lowercase, SHA256, uppercase.
 */

export type EcpayMode = "stage" | "prod";

export interface EcpayConfig {
  merchantId: string;
  hashKey: string;
  hashIV: string;
  mode: EcpayMode;
  actionUrl: string;
}

const STAGE_URL = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
const PROD_URL = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

export function getEcpayConfig(): EcpayConfig | null {
  const merchantId = process.env.ECPAY_MERCHANT_ID;
  const hashKey = process.env.ECPAY_HASH_KEY;
  const hashIV = process.env.ECPAY_HASH_IV;
  if (!merchantId || !hashKey || !hashIV) return null;
  const mode: EcpayMode = process.env.ECPAY_MODE === "prod" ? "prod" : "stage";
  return {
    merchantId,
    hashKey,
    hashIV,
    mode,
    actionUrl: mode === "prod" ? PROD_URL : STAGE_URL,
  };
}

// ECPay expects amounts as whole NT dollars (no decimals).
export const ECPAY_PRODUCTS = {
  ebook: { name: "BCI 品牌資本指數方法論電子書", amount: 390 },
} as const;

export type EcpayProduct = keyof typeof ECPAY_PRODUCTS;

// Mimics PHP urlencode / .NET HttpUtility.UrlEncode as required by ECPay:
// space → "+", then lowercase the percent-encoding. encodeURIComponent already
// leaves -_.!~*'() literal, which matches ECPay's expected final form.
function ecpayUrlEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+").toLowerCase();
}

export function makeCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string,
): string {
  const sortedKeys = Object.keys(params).sort((a, b) =>
    a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0,
  );
  const joined = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
  const raw = `HashKey=${hashKey}&${joined}&HashIV=${hashIV}`;
  const encoded = ecpayUrlEncode(raw);
  return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export function verifyCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string,
): boolean {
  const received = params.CheckMacValue;
  if (!received) return false;
  const rest: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== "CheckMacValue") rest[k] = v;
  }
  const expected = makeCheckMacValue(rest, hashKey, hashIV);
  return expected === received.toUpperCase();
}

function tradeDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function newMerchantTradeNo(prefix = "SYM"): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString("hex");
  return `${prefix}${ts}${rand}`.slice(0, 20);
}

// Builds the full AIO field set (including CheckMacValue) for an auto-submit form.
export function buildCheckoutParams(opts: {
  config: EcpayConfig;
  product: EcpayProduct;
  origin: string;
  email?: string;
}): Record<string, string> {
  const item = ECPAY_PRODUCTS[opts.product];
  const params: Record<string, string> = {
    MerchantID: opts.config.merchantId,
    MerchantTradeNo: newMerchantTradeNo(),
    MerchantTradeDate: tradeDate(),
    PaymentType: "aio",
    TotalAmount: String(item.amount),
    TradeDesc: "Symcio BCI eBook",
    ItemName: item.name,
    ReturnURL: `${opts.origin}/api/ecpay/callback`,
    ClientBackURL: `${opts.origin}/checkout/success?product=${opts.product}&gw=ecpay`,
    ChoosePayment: "ALL",
    EncryptType: "1",
    CustomField1: opts.product,
  };
  if (opts.email) params.CustomField2 = opts.email.slice(0, 50);
  params.CheckMacValue = makeCheckMacValue(params, opts.config.hashKey, opts.config.hashIV);
  return params;
}
