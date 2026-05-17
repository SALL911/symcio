"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "首頁" },
  { href: "/dashboard", label: "排行榜" },
  { href: "/audit", label: "診斷" },
  { href: "/pricing", label: "方案" },
  { href: "/faq/enterprise", label: "知識庫" },
  { href: "/tools", label: "工具" },
  { href: "/about", label: "關於" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Symcio · BrandOS — 首頁"
          className="flex items-center gap-3 no-underline"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/symcio-logo.svg"
            alt="Symcio"
            className="h-7 w-auto md:h-8"
          />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:inline-block">
            BrandOS
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted hover:text-accent no-underline"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://discord.gg/jGWJr2Sd"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-card bg-accent px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
          >
            加入社群
          </a>
        </nav>

        <button
          type="button"
          aria-label="開啟選單"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink"
        >
          <span className="sr-only">menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-card px-3 py-3 text-sm text-ink no-underline hover:bg-surface-2"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://discord.gg/jGWJr2Sd"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-card bg-accent px-4 py-3 text-center text-sm font-semibold text-white no-underline"
            >
              加入社群
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
