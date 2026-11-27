import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export type LegalSection = { heading: string; body: (string | string[])[] };

/** 政策類頁面（隱私權 / 服務條款 / 退款）共用版型。段落為字串，條列為字串陣列。 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Policy</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">最後更新：{updated}</p>
        <p className="mt-6 text-base leading-relaxed text-muted">{intro}</p>
        {sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-xl font-bold">{s.heading}</h2>
            {s.body.map((b, i) =>
              Array.isArray(b) ? (
                <ul key={i} className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted">
                  {b.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="mt-3 text-base leading-relaxed text-muted">
                  {b}
                </p>
              ),
            )}
          </section>
        ))}
        <section className="mt-10 rounded-card border border-line bg-surface-2 p-6">
          <h2 className="text-lg font-semibold">聯絡我們</h2>
          <p className="mt-2 text-base text-muted">
            對本頁內容有疑問，請來信{" "}
            <a href="mailto:info@symcio.tw" className="text-accent underline">
              info@symcio.tw
            </a>
            ，我們會在 2 個工作天內回覆。
          </p>
        </section>
      </article>
      <Footer />
    </main>
  );
}
