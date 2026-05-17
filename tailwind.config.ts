import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page background — warm off-white
        bg: "#F7F6F3",
        // Primary dark text / deepest brand tone
        ink: "#1A2E22",
        // Symcio brand green — primary CTA
        accent: "#2A4D3A",
        "accent-dim": "#1F3A2C",
        "accent-soft": "#E6EEE8",
        // Body text de-emphasized
        muted: "#6B7B6F",
        "muted-dim": "#94A29A",
        // Hairlines and dividers
        line: "#E5E2D9",
        "line-soft": "#EFEDE5",
        // Card surfaces
        surface: "#FFFFFF",
        "surface-2": "#FAFAF9",
        // Status colors
        excellent: "#2A8C5F",
        good: "#3B7AD9",
        warning: "#D99A1F",
        danger: "#D14848",
        // Editorial gold — demo data, draft, advisory callouts
        gold: "#7A5C08",
        "gold-soft": "#F5EBC4",
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "Noto Sans TC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "IBM Plex Mono",
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
