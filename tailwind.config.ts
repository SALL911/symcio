import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        accent: "#c8f55a",
        "accent-dim": "#a8d140",
        muted: "#9ca3af",
        "muted-dim": "#6b7280",
        line: "#262626",
        "line-soft": "#2a2a2a",
        surface: "#111111",
        "surface-2": "#161616",
        excellent: "#2dd4a0",
        good: "#378ADD",
        warning: "#fbbf24",
        danger: "#f87171",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans TC",
          "sans-serif",
        ],
        mono: [
          "DM Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
