import { ImageResponse } from "next/og";

// 全站預設社群 / AI 摘要卡片（1200×630）。build 時靜態產生。
// 文字用英文：ImageResponse 內建字型不含 CJK，避免中文顯示為方框。
export const alt = "Symcio · BrandOS — AI Visibility Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#1F3A2C",
          color: "#F7F6F3",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#E6EEE8" }}>
          SYMCIO · BRANDOS
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
            AI Visibility Intelligence
          </div>
          <div style={{ fontSize: 34, marginTop: 24, color: "#E6EEE8" }}>
            Brand exposure, ranking and influence across ChatGPT, Claude,
            Gemini and Perplexity.
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#E6EEE8" }}>symcio.tw</div>
      </div>
    ),
    size
  );
}
