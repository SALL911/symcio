/**
 * Symcio 官方社群帳號 — 單一真相來源（SSoT）。
 *
 * WHY
 *   浮動連結、Footer、Organization schema 的 sameAs 都從這裡讀，
 *   帳號異動只改一處，AI 引擎與搜尋引擎看到的實體連結保持一致（NAP 一致性）。
 *
 * LINE 注意事項
 *   chat.line.biz/U…（後台聊天室）與 manager.line.biz 都是管理端網址，訪客打不開。
 *   對外加好友連結必須是 https://lin.ee/xxxx 或 https://line.me/R/ti/p/@basic-id，
 *   於 LINE Official Account Manager →「增加好友」→「建立網址」取得後，
 *   填入 NEXT_PUBLIC_LINE_ADD_FRIEND_URL。未設定時 LINE 按鈕不顯示，避免導向失效頁。
 */

export type SocialKey =
  | "line"
  | "instagram"
  | "facebook"
  | "threads"
  | "x"
  | "bluesky"
  | "linkedin";

export interface SocialProfile {
  key: SocialKey;
  label: string;
  url: string;
}

const LINE_URL_RE = /^https:\/\/(lin\.ee|line\.me|page\.line\.me)\/[\w@/?=&.%~-]+$/;

function lineAddFriendUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL?.trim();
  return raw && LINE_URL_RE.test(raw) ? raw : null;
}

const STATIC_PROFILES: SocialProfile[] = [
  { key: "instagram", label: "Instagram", url: "https://www.instagram.com/symcio.tw/" },
  { key: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61582414050958" },
  { key: "threads", label: "Threads", url: "https://www.threads.com/@symcio.tw" },
  { key: "x", label: "X", url: "https://x.com/symciostudio" },
  { key: "bluesky", label: "Bluesky", url: "https://bsky.app/profile/symcioai.bsky.social" },
  // 公開頁用數字 ID 即可，LinkedIn 會自動轉到 vanity URL；/admin/ 路徑只有管理員能開
  { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/105910896/" },
];

/** 全部對外帳號（LINE 未設定網址時自動略過）。 */
export function socialProfiles(): SocialProfile[] {
  const line = lineAddFriendUrl();
  return [
    ...(line ? [{ key: "line" as const, label: "LINE 官方帳號", url: line }] : []),
    ...STATIC_PROFILES,
  ];
}

/** 浮動按鈕只放三個主力轉換通路：LINE / Instagram / Facebook。 */
export function floatingProfiles(): SocialProfile[] {
  const order: SocialKey[] = ["line", "instagram", "facebook"];
  const all = socialProfiles();
  return order
    .map((k) => all.find((p) => p.key === k))
    .filter((p): p is SocialProfile => Boolean(p));
}
