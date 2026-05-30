/**
 * ============================================================================
 *  Teams · 利益關係單位「單色 LOGO」元件
 * ============================================================================
 *
 *  設計重點：好調整、好統一換色、好替換。
 *
 *  • 透過 CSS mask 把 public/teams/logos/<id>.svg 渲染成「單一顏色」，
 *    顏色由 currentColor 決定 → 整站要改色只要改外層文字色，不用改圖檔。
 *  • 換成正式 LOGO 時：直接覆蓋同名 .svg（內容是單色實心形狀即可），
 *    這支元件、頁面、資料檔都不用改。
 *  • 沒給 logo（或想先佔位）時，自動用 alias 首字產生「單色字標 monogram」。
 *
 *  為什麼用 mask 而不是 <img>？
 *    <img> 會直接畫出 SVG 原本的顏色，無法跟著主題換色；
 *    mask 只取形狀（alpha），填色交給 currentColor，才能真正「單色化、可換色」。
 * ============================================================================
 */

type Props = {
  /** 單色 SVG 路徑（public 下）。留空則改用文字 monogram。 */
  logo?: string;
  /** 顯示用代稱，monogram 取首字 */
  alias: string;
  /** 像素尺寸（正方形），預設 40 */
  size?: number;
  className?: string;
};

export function StakeholderLogo({ logo, alias, size = 40, className }: Props) {
  if (logo) {
    return (
      <span
        role="img"
        aria-label={alias}
        className={className}
        style={{
          display: "inline-block",
          width: size,
          height: size,
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  // —— Monogram 後備：alias 首字，單色實心圓 ——
  const initial = Array.from(alias)[0] ?? "·";
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label={alias}
      className={className}
    >
      <circle cx="20" cy="20" r="19" fill="currentColor" opacity="0.12" />
      <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight="600"
        fill="currentColor"
      >
        {initial}
      </text>
    </svg>
  );
}
