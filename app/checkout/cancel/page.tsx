import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

export const metadata: Metadata = {
  title: "付款取消 — Symcio",
  robots: { index: false, follow: false },
};

export default function CheckoutCancel() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-2xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Symcio
        </p>
        <h1 className="mt-3 text-4xl font-semibold">付款已取消。</h1>
        <p className="mt-6 text-lg text-muted">
          沒關係。你的 Free Scan 報告仍然有效。
          若有疑問或需要客製方案，可以直接來信 <a href="mailto:info@symcio.tw" className="underline">info@symcio.tw</a>
          或回到 symcio.tw 重新下單。
        </p>
        <div className="mt-10 flex gap-3">
          <Link
            href="/"
            className="inline-block border border-ink px-4 py-2 text-sm no-underline hover:bg-ink hover:text-white"
          >
            ← 回到 symcio.tw
          </Link>
          <Link
            href={"/api/checkout?product=audit" as Route}
            className="inline-block bg-ink px-4 py-2 text-sm text-white no-underline hover:opacity-90"
          >
            再試一次 →
          </Link>
        </div>
      </section>
    </main>
  );
}
