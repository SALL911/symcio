/**
 * UTM + click ID 第一觸點（first-touch）歸因。
 *
 * 策略：
 *   - 只在 **sessionStorage 沒值** 時寫入 → 保留使用者第一次進站的廣告來源
 *   - 就算他後來從 referrer 自己走 Google 找回來，我們仍知道他最初是 FB 廣告來的
 *   - last-touch 想看的話直接讀 document.referrer + 當前 URL，不需另存
 *
 * 為什麼不用 cookie：
 *   - 跨域 iframe / 3rd-party cookie 開始被擋，sessionStorage 更可靠
 *   - cookie 要處理 SameSite / Secure，維護成本高
 *   - sessionStorage 的限制（關 tab 就沒）對廣告歸因 ok——lead 會在同一 session 完成
 */

const KEY = "symcio_attribution_v1";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  first_landing_url?: string;
  first_touch_at?: string; // ISO 8601
  fbclid?: string;
  gclid?: string;
  li_fat_id?: string;
}

function readParams(search: string): Partial<Attribution> {
  const p = new URLSearchParams(search);
  const pick = (k: string): string | undefined => {
    const v = p.get(k);
    return v ? v.slice(0, 200) : undefined;
  };
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_content: pick("utm_content"),
    utm_term: pick("utm_term"),
    fbclid: pick("fbclid"),
    gclid: pick("gclid"),
    li_fat_id: pick("li_fat_id"),
  };
}

/**
 * 當前 URL 有 UTM / click ID → 寫入 sessionStorage（若已存在不覆寫）。
 * 沒有 UTM 但有 referrer → 仍記 first_landing_url + referrer（organic 分析用）。
 * 回傳最終生效的 attribution payload。
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  // 已經存在 → 保留 first-touch 不動
  const existing = readStorage();
  if (existing && Object.keys(existing).length > 0) return existing;

  const parsed = readParams(window.location.search);
  const hasAnyUtm = Object.values(parsed).some(Boolean);
  const referrer = document.referrer?.slice(0, 500) || undefined;

  // 沒有 UTM 也沒 referrer（直接輸入網址）→ 不記
  if (!hasAnyUtm && !referrer) return {};

  const attribution: Attribution = {
    ...parsed,
    referrer,
    first_landing_url: window.location.href.slice(0, 500),
    first_touch_at: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    /* quota / disabled — ignore */
  }
  return attribution;
}

function readStorage(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/** 給各 form 提交時呼叫，讀出當前存的歸因 payload。 */
export function getAttribution(): Attribution {
  return readStorage() ?? {};
}
