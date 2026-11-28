// 對外文字的紅線檢查。AI 產生的回覆必須通過這裡才會送給客戶，
// 不通過就退回固定範本。規則寧可誤擋，不可漏放。

const BANNED: { name: string; re: RegExp }[] = [
  // 排名與獨佔宣稱
  { name: "superlative", re: /(第一(?![次步時])|唯一|首創|獨家|最強|最好|最佳|No\.?\s*1|number one|the only|world'?s first)/i },
  // 成效與金額承諾
  { name: "guarantee", re: /(保證|保障|一定(會|能|可以)|必定|絕對|穩賺|100\s*%|百分之百|零風險|guarantee)/i },
  // 合作與授權關係
  { name: "partnership", re: /(官方(合作|夥伴|授權)|授權代表|official partner|與\s*(Bloomberg|SimilarWeb|SEMrush|OpenAI|Google|Meta)\s*合作)/i },
  // 代做優化（Symcio 只量測）
  { name: "optimization", re: /(幫(你|您)(優化|操作|代操)|代操|代為優化|我們(會|可以)(幫|替)(你|您)(提升|提高)排名)/ },
  // 專業意見
  { name: "advice", re: /(投資建議|法律意見|稅務建議)/ },
  // 自行報價（價格只能來自固定事實）
  { name: "price", re: /(NT\$|NTD|新台幣|台幣|\$)\s*(?!390\b)[\d,]{3,}/i },
];

const ALLOWED_HOSTS = ["symcio.tw", "www.symcio.tw"];

export type GuardResult = { ok: true } | { ok: false; reason: string };

export function checkOutbound(text: string, maxLen = 600): GuardResult {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty" };
  if (t.length > maxLen) return { ok: false, reason: "too-long" };
  for (const b of BANNED) {
    if (b.re.test(t)) return { ok: false, reason: b.name };
  }
  // 只允許自家網域的連結，避免模型捏造網址
  const urls = t.match(/https?:\/\/[^\s)）」』]+/gi) || [];
  for (const u of urls) {
    try {
      if (!ALLOWED_HOSTS.includes(new URL(u).hostname.toLowerCase())) {
        return { ok: false, reason: "foreign-url" };
      }
    } catch {
      return { ok: false, reason: "bad-url" };
    }
  }
  return { ok: true };
}
