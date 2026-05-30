/**
 * ============================================================================
 *  Teams · 線條插畫頭像庫（Notion 風 / 單色 / 可換色）
 * ============================================================================
 *
 *  • 全部為純 SVG 線稿，stroke 使用 currentColor → 只要外層設定文字顏色，
 *    頭像就跟著變色（單色、好統一替換）。
 *  • 沒有任何外部圖檔，所以「好調整、好替換、好版控」。
 *  • 要新增風格：在 PATHS 加一筆 line-09 ... 即可，資料檔就能直接引用。
 *  • 之後要換成真人照片：在 teams.data.ts 該筆填 photo 欄位，
 *    卡片會優先顯示照片，不必動這支檔。
 *
 *  風格說明：簡約連續線條的半身 / 臉部肖像，搭配柔色圓底，
 *  與全站「暖白底 + 細線 + 深綠」的 Notion-like 調性一致。
 * ============================================================================
 */

export type AvatarId =
  | "line-01"
  | "line-02"
  | "line-03"
  | "line-04"
  | "line-05"
  | "line-06"
  | "line-07"
  | "line-08";

type AvatarProps = {
  id: AvatarId;
  /** 像素尺寸（正方形），預設 80 */
  size?: number;
  className?: string;
  /** 無障礙標題 */
  title?: string;
};

/**
 * 每個頭像只畫「線稿前景」，共用的圓底與肩線由 <Avatar> 外框統一提供，
 * 確保所有頭像對齊、留白一致。座標系統一為 viewBox 0 0 80 80。
 */
const FOREGROUND: Record<AvatarId, JSX.Element> = {
  // 01 — 短髮 · 基本款
  "line-01": (
    <>
      <circle cx="40" cy="33" r="13" />
      <path d="M27 30c0-9 6-15 13-15s13 6 13 15" />
      <path d="M34 34c1.5 1.6 4 1.6 5.5 0" />
      <path d="M40.5 34c1.5 1.6 4 1.6 5.5 0" />
      <path d="M38 38c1.2 1 2.8 1 4 0" />
    </>
  ),
  // 02 — 中長髮 · 旁分
  "line-02": (
    <>
      <circle cx="40" cy="34" r="12.5" />
      <path d="M28 33c-1-11 5-18 12-18 8 0 13 6 13 15 0 2-.5 4-1 5" />
      <path d="M28 31c4-1 7-3 9-6 2 4 6 6 11 6" />
      <circle cx="35" cy="34" r="1.1" />
      <circle cx="45" cy="34" r="1.1" />
      <path d="M37.5 39c1.5 1 3.5 1 5 0" />
    </>
  ),
  // 03 — 短髮 · 眼鏡
  "line-03": (
    <>
      <circle cx="40" cy="33" r="13" />
      <path d="M27 31c0-10 6-16 13-16s13 6 13 16" />
      <circle cx="35" cy="34" r="3.2" />
      <circle cx="45" cy="34" r="3.2" />
      <path d="M38.2 34h3.6" />
      <path d="M31.8 33.5l-2.4-.6M48.2 33.5l2.4-.6" />
      <path d="M37.5 40c1.6 1.1 3.4 1.1 5 0" />
    </>
  ),
  // 04 — 包頭 / 丸子頭
  "line-04": (
    <>
      <circle cx="40" cy="34" r="12.5" />
      <circle cx="40" cy="16" r="4.5" />
      <path d="M29 32c0-9 5-14 11-14s11 5 11 14" />
      <circle cx="35.5" cy="35" r="1.1" />
      <circle cx="44.5" cy="35" r="1.1" />
      <path d="M37.5 40c1.5 1 3.5 1 5 0" />
    </>
  ),
  // 05 — 捲 / 蓬鬆髮
  "line-05": (
    <>
      <circle cx="40" cy="35" r="12" />
      <path d="M27 33c-3-2-3-7 0-9-1-4 2-8 6-8 2-3 6-4 9-2 4-2 9 1 9 6 4 1 5 6 2 9" />
      <circle cx="35.5" cy="36" r="1.1" />
      <circle cx="44.5" cy="36" r="1.1" />
      <path d="M37.5 41c1.5 1 3.5 1 5 0" />
    </>
  ),
  // 06 — 短髮 · 鬍子
  "line-06": (
    <>
      <circle cx="40" cy="33" r="13" />
      <path d="M27 31c0-10 6-16 13-16s13 6 13 16" />
      <circle cx="35.5" cy="33" r="1.1" />
      <circle cx="44.5" cy="33" r="1.1" />
      <path d="M33 41c2 3 5 4.5 7 4.5s5-1.5 7-4.5" />
      <path d="M36 38.5c1.3 1 2.7 1 4 0" />
    </>
  ),
  // 07 — 旁分 · 眼鏡
  "line-07": (
    <>
      <circle cx="40" cy="34" r="12.5" />
      <path d="M28 32c-1-11 5-17 12-17 7 0 12 6 12 14" />
      <path d="M28 31c5-1 9-3 11-7" />
      <circle cx="35" cy="35" r="3" />
      <circle cx="45" cy="35" r="3" />
      <path d="M38 35h4" />
      <path d="M37.5 41c1.5 1 3.5 1 5 0" />
    </>
  ),
  // 08 — 短髮 · 微笑
  "line-08": (
    <>
      <circle cx="40" cy="33" r="13" />
      <path d="M28 32c0-10 5-16 12-16s12 6 12 16" />
      <path d="M34 32.5c1.2-1 3-1 4.2 0" />
      <path d="M41.8 32.5c1.2-1 3-1 4.2 0" />
      <path d="M34 39c2 2.4 4 3.4 6 3.4s4-1 6-3.4" />
    </>
  ),
};

export function Avatar({ id, size = 80, className, title }: AvatarProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? "成員頭像"}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      {/* 柔色圓底 —— 用 currentColor + 透明度，跟前景同色系但更淡 */}
      <circle cx="40" cy="40" r="39" fill="currentColor" opacity="0.07" />
      <circle cx="40" cy="40" r="39" fill="none" stroke="currentColor" strokeOpacity="0.18" />
      {/* 肩線（共用） */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 70c1-9 7-15 16-15s15 6 16 15" />
        {FOREGROUND[id]}
      </g>
    </svg>
  );
}
