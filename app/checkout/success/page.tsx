import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe/client";

export const metadata: Metadata = {
  title: "付款成功 — Symcio",
  robots: { index: false, follow: false },
};

async function resolveProduct(sessionId?: string): Promise<{
  product: "audit" | "optimization" | "ebook";
  paid: boolean;
}> {
  if (!sessionId) return { product: "audit", paid: false };
  const stripe = getStripe();
  if (!stripe) return { product: "audit", paid: false };
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const product = session.metadata?.product;
    return {
      product: product === "ebook" || product === "optimization" ? product : "audit",
      paid: session.payment_status === "paid",
    };
  } catch {
    return { product: "audit", paid: false };
  }
}

function EbookSuccess({ sessionId, paid }: { sessionId?: string; paid: boolean }) {
  const downloadHref = (
    sessionId ? `/api/ebook/download?session_id=${encodeURIComponent(sessionId)}` : "#"
  ) as Route;
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-2xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Symcio · BCI eBook
        </p>
        <h1 className="mt-3 text-4xl font-semibold">付款成功，電子書已就緒。</h1>
        <p className="mt-6 text-lg text-muted">
          感謝你購買《BCI 品牌資本指數方法論》電子書。下載連結也已寄到你的 email。
        </p>
        <div className="mt-10 rounded-card border-l-4 border-accent bg-surface-2 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            立即下載
          </p>
          {sessionId && paid ? (
            <a
              href={downloadHref}
              className="mt-4 inline-block rounded-card bg-accent px-6 py-3 text-base font-semibold text-white no-underline hover:bg-accent-dim"
            >
              下載 PDF →
            </a>
          ) : (
            <p className="mt-3 text-sm text-ink">
              我們已將下載連結寄到你的 email（幾分鐘內）。如未收到，請來信
              <a href="mailto:info@symcio.tw" className="underline"> info@symcio.tw</a>。
            </p>
          )}
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block rounded-card border border-accent px-4 py-2 text-sm text-accent no-underline hover:bg-accent hover:text-white"
          >
            ← 回到 symcio.tw
          </Link>
        </div>
      </section>
    </main>
  );
}

function AuditSuccess() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-2xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Symcio · AI Visibility Intelligence
        </p>
        <h1 className="mt-3 text-4xl font-semibold">付款成功。</h1>
        <p className="mt-6 text-lg text-muted">
          我們已收到你的訂單。Symcio 團隊會在 <strong className="text-ink">24 小時內</strong>
          交付完整的 AI Visibility Audit（20 prompts × 4 engines + 競品對比 + 改善建議 PDF）。
        </p>
        <div className="mt-10 rounded-card border-l-4 border-accent bg-surface-2 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            接下來會發生什麼
          </p>
          <ol className="mt-3 space-y-2 text-sm text-ink">
            <li>1. Stripe 寄出收據到你的 email（幾分鐘內）。</li>
            <li>2. Symcio 啟動四引擎測試（ChatGPT / Claude / Gemini / Perplexity）。</li>
            <li>3. 24 小時內，完整報告 PDF 與 Calendly 連結會寄到你的 email。</li>
            <li>4. 如 48 小時仍未收到，來信 <a href="mailto:info@symcio.tw" className="underline">info@symcio.tw</a> 我們親自處理。</li>
          </ol>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block rounded-card border border-accent px-4 py-2 text-sm text-accent no-underline hover:bg-accent hover:text-white"
          >
            ← 回到 symcio.tw
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: { session_id?: string; product?: string; gw?: string };
}) {
  const sessionId = searchParams.session_id;
  // Stripe passes session_id (gated download possible); ECPay/PayPal pass
  // product=ebook (delivery is via email, so just show the confirmation).
  if (searchParams.product === "ebook" && !sessionId) {
    return <EbookSuccess paid={false} />;
  }
  const { product, paid } = await resolveProduct(sessionId);
  if (product === "ebook") {
    return <EbookSuccess sessionId={sessionId} paid={paid} />;
  }
  return <AuditSuccess />;
}
