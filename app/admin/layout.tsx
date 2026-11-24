import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Symcio 內部後台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Symcio · 內部後台</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-ink no-underline hover:text-accent">
              漏斗看板
            </Link>
            <Link href="/admin/leads" className="text-ink no-underline hover:text-accent">
              名單管理
            </Link>
          </nav>
          <span className="ml-auto text-xs text-muted">內含個資，請勿截圖外流</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</div>
    </div>
  );
}
