/**
 * Symcio 官方社群帳號（單一真相來源）。
 *
 * Footer、Organization schema sameAs、浮動 LINE 按鈕、電子報頁尾都從這裡讀。
 * LINE 官方帳號 ID 由 NEXT_PUBLIC_LINE_OA_ID 提供（例：@symcio），未設定時不顯示 LINE 入口，
 * 避免連到錯誤帳號。
 */

export interface SocialLink {
  key: "line" | "instagram" | "facebook" | "threads" | "discord" | "github";
  label: string;
  href: string;
}

const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID?.trim() || "";

/** LINE 加好友連結；`@` 需 URL encode。 */
export const LINE_ADD_FRIEND_URL = LINE_OA_ID
  ? `https://line.me/R/ti/p/${encodeURIComponent(LINE_OA_ID.startsWith("@") ? LINE_OA_ID : `@${LINE_OA_ID}`)}`
  : "";

export const SOCIAL_LINKS: SocialLink[] = [
  ...(LINE_ADD_FRIEND_URL
    ? [{ key: "line" as const, label: "LINE 官方帳號", href: LINE_ADD_FRIEND_URL }]
    : []),
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/symcio.tw" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/Symcio.tw" },
  { key: "threads", label: "Threads", href: "https://www.threads.com/@symcio.tw" },
  { key: "discord", label: "Discord 社群", href: "https://discord.gg/jGWJr2Sd" },
  { key: "github", label: "GitHub（方法論開源）", href: "https://github.com/sall911/symcio" },
];

/** Organization schema 的 sameAs：只列公開個人檔案頁，不含加好友短連結。 */
export const SAME_AS: string[] = SOCIAL_LINKS.filter((s) => s.key !== "line").map((s) => s.href);
