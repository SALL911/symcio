"use client";

import { floatingProfiles, type SocialKey } from "@/lib/social/links";
import { trackAdEvent } from "@/lib/tracking/events";

const STYLE: Partial<Record<SocialKey, string>> = {
  line: "bg-[#06C755]",
  facebook: "bg-[#1877F2]",
  instagram:
    "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
};

function Icon({ name }: { name: SocialKey }) {
  if (name === "line") {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path
          fill="#fff"
          d="M16 5C9.4 5 4 9.3 4 14.6c0 4.7 4.2 8.7 9.9 9.5.4.1.9.3 1 .6.1.3.1.8 0 1.1l-.2 1c0 .3-.2 1.2 1 .7 1.3-.5 6.8-4 9.3-6.9 1.6-1.8 2.7-3.7 2.7-5.8C28 9.3 22.6 5 16 5z"
        />
        <text
          x="16"
          y="17.6"
          textAnchor="middle"
          fontSize="6.4"
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
          fill="#06C755"
        >
          LINE
        </text>
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          fill="#fff"
          d="M13.5 21v-7.1h2.4l.4-2.9h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3-.1-1.1-.2-2.1-.2-2.2 0-3.7 1.3-3.7 3.800V11H8.200v2.900h2.400V21h2.900z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none" />
    </svg>
  );
}

/**
 * 右下角浮動社群連結（LINE / Instagram / Facebook）。
 * bottom 預留空間給 HubSpot 對話視窗的啟動鈕，兩者不重疊；列印時隱藏。
 */
export function FloatingSocial() {
  const profiles = floatingProfiles();
  if (profiles.length === 0) return null;

  return (
    <nav
      aria-label="Symcio 官方社群"
      className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 print:hidden md:right-6"
    >
      {profiles.map((p) => (
        <a
          key={p.key}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={p.label}
          title={p.label}
          onClick={() => trackAdEvent("Contact", { channel: p.key, placement: "floating" })}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-1 ring-black/5 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${STYLE[p.key] ?? "bg-accent"}`}
        >
          <Icon name={p.key} />
        </a>
      ))}
    </nav>
  );
}
