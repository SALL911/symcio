import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "升級成功 — VIP Concierge Full Setup",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function UpgradeSuccess() {
  const bookingUrl = process.env.KIT_UPGRADE_BOOKING_URL;
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-2xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Symcio · Starter Kit
        </p>
        <h1 className="mt-3 text-4xl font-semibold">升級完成。</h1>
        <p className="mt-6 text-lg text-muted">
          已收到你的 $260 升級款，$39 Starter Kit 已全額折抵。下一步是預約遠端建置時段。
        </p>
        <div className="mt-10 rounded-card border-l-4 border-accent bg-surface-2 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">建置前請備妥</p>
          <ol className="mt-3 space-y-2 text-sm text-ink">
            <li>1. GitHub 與 Vercel 帳號（可邀請協作者）。</li>
            <li>2. HubSpot Super Admin 權限（建立 Private App 用）。</li>
            <li>3. 欲綁定網域的 DNS 管理權限。</li>
          </ol>
        </div>
        <div className="mt-10">
          {bookingUrl ? (
            <a
              href={bookingUrl}
              className="inline-block rounded-card bg-accent px-5 py-3 text-sm text-white no-underline"
            >
              預約建置時段 →
            </a>
          ) : (
            <p className="text-sm text-muted">
              確認信已寄到你的 email，回覆該信提供兩個方便的時段即可，或來信{" "}
              <a href="mailto:info@symcio.tw" className="underline">info@symcio.tw</a>。
            </p>
          )}
        </div>
        <div className="mt-10">
          <Link href="/" className="text-sm text-muted underline">← 回到 symcio.tw</Link>
        </div>
      </section>
    </main>
  );
}
