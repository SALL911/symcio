import { ECOSYSTEM, type EcosystemMember } from "@/lib/ecosystem";

/**
 * Ecosystem & standards alignment section for the /teams page.
 *
 * Usage in app/teams/page.tsx:
 *   import { EcosystemLogos } from "@/components/EcosystemLogos";
 *   ...
 *   <EcosystemLogos />
 *
 * ⚠️ Only members with status "active" render an official logo. Until a
 * membership/adopter status is confirmed in writing, the entry shows a
 * neutral "申請中 / Applied" or "規劃中 / Planned" badge — never the official
 * mark — to avoid misusing protected trademarks.
 */

function statusLabel(m: EcosystemMember): { text: string; tone: string } {
  switch (m.status) {
    case "active":
      return { text: "成員 / Member", tone: "text-accent border-accent" };
    case "applied":
      return { text: "申請中 / Applied", tone: "text-muted border-line" };
    default:
      return { text: "規劃中 / Planned", tone: "text-muted border-line" };
  }
}

export function EcosystemLogos() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Ecosystem & Standards
        </p>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          生態系與標準對齊
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Symcio 與下列國際標準與組織對齊。標記「成員」者為已核准；
          「申請中」者為籌備期已送出參與意願，待對方核准後轉為正式成員。
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ECOSYSTEM.map((m) => {
            const s = statusLabel(m);
            return (
              <li
                key={m.name}
                className="flex items-center justify-between rounded-card border border-line bg-surface px-5 py-4"
              >
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink no-underline hover:text-accent"
                >
                  {m.status === "active" && m.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.logo} alt={m.name} className="h-7" />
                  ) : (
                    m.name
                  )}
                </a>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${s.tone}`}
                >
                  {s.text}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 font-mono text-[11px] text-muted">
          核准後請在 lib/ecosystem.ts 將 status 改為 "active" 並補上符合對方規範的 logo。
        </p>
      </div>
    </section>
  );
}
