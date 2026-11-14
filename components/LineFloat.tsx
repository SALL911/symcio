import { LINE_ADD_FRIEND_URL } from "@/lib/social";

/** 右下角 LINE 加好友浮動按鈕；未設定 NEXT_PUBLIC_LINE_OA_ID 時不渲染。 */
export function LineFloat() {
  if (!LINE_ADD_FRIEND_URL) return null;
  return (
    <a
      href={LINE_ADD_FRIEND_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="加入 Symcio LINE 官方帳號"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#06C755] px-4 py-3 text-sm font-semibold text-white no-underline shadow-lg hover:opacity-90"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M12 2.5C6.48 2.5 2 6.14 2 10.62c0 4.01 3.56 7.37 8.36 8.01.33.07.77.22.88.5.1.25.07.65.03.9l-.14.86c-.04.25-.2.99.87.54 1.07-.45 5.76-3.39 7.86-5.81C21.31 14.03 22 12.4 22 10.62 22 6.14 17.52 2.5 12 2.5Z" />
      </svg>
      LINE 諮詢
    </a>
  );
}
