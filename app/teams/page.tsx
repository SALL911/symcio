import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/teams/Avatar";
import { StakeholderLogo } from "@/components/teams/StakeholderLogo";
import {
  LEADERSHIP,
  ADVISORS,
  STAKEHOLDERS,
  type AccentToken,
} from "@/lib/teams/teams.data";

export const metadata: Metadata = {
  title: "團隊與關鍵夥伴 | Symcio BrandOS",
  description:
    "Symcio · BrandOS 的經營團隊、顧問群與關鍵利益關係單位。籌備期間以模擬職位與示意代稱呈現，正式設立後依實際人員與授權更新。",
};

/** AccentToken → 靜態 text 顏色 class（Tailwind 需要完整字串，不能動態拼接） */
const ACCENT_TEXT: Record<AccentToken, string> = {
  accent: "text-accent",
  excellent: "text-excellent",
  good: "text-good",
  warning: "text-warning",
  gold: "text-gold",
};

function SimBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gold-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[1px] text-gold">
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-widest text-accent">
      {children}
    </p>
  );
}

export default function TeamsPage() {
  // 依類別分組利益關係單位
  const stakeholderCategories = Array.from(
    new Set(STAKEHOLDERS.map((s) => s.category)),
  );

  return (
    <main className="min-h-screen bg-bg text-ink">
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionLabel>團隊 · Teams &amp; Stakeholders</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            打造 AI 能見度量化標準的
            <br />
            團隊與關鍵夥伴。
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            Symcio · BrandOS 由跨品牌、ESG、AI 與資本領域的成員與顧問共同推動。
            目前公司法人尚在籌備登記，本頁的職位、顧問與利益關係單位
            <strong className="text-ink"> 以模擬與示意方式呈現</strong>，
            正式設立並取得授權後，將依實際人員與單位逐筆更新。
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface px-4 py-3">
            <SimBadge label="模擬" />
            <span className="text-sm text-muted">
              職位與人員為佔位示意
            </span>
            <span className="mx-1 text-line">·</span>
            <SimBadge label="諧音" />
            <span className="text-sm text-muted">
              單位名稱為非官方代稱，未使用任何官方 LOGO
            </span>
          </div>
        </div>
      </section>

      {/* ── 1. 經營團隊 ──────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <div className="flex items-end justify-between">
            <div>
              <SectionLabel>經營團隊 · Leadership</SectionLabel>
              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                核心 C-Level
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-muted md:block">
              CEO / COO / CFO / CTO 為模擬配置，延伸自全站設計語彙，
              待實際人員確認後做人事修改。
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP.map((m) => (
              <article
                key={m.id}
                className="group rounded-card border border-line bg-surface p-6 transition-colors hover:border-accent"
              >
                <div className={`${ACCENT_TEXT[m.accent]}`}>
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt={m.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar id={m.avatar} size={80} title={`${m.title} 頭像`} />
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold uppercase tracking-widest ${ACCENT_TEXT[m.accent]}`}
                  >
                    {m.titleEn}
                  </span>
                  {m.simulated ? <SimBadge label="模擬" /> : null}
                </div>

                <h3 className="mt-1 text-lg font-semibold text-ink">
                  {m.title}
                </h3>
                <p className="font-mono text-xs text-muted-dim">{m.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {m.focus}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. 顧問群 ────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <SectionLabel>顧問群 · Advisors</SectionLabel>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            策略與領域顧問
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADVISORS.map((a) => (
              <article
                key={a.id}
                className="rounded-card border border-line bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 ${ACCENT_TEXT[a.accent]}`}>
                    {a.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar id={a.avatar} size={56} title={`${a.title} 頭像`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-ink">
                        {a.title}
                      </h3>
                      {a.simulated ? <SimBadge label="模擬" /> : null}
                    </div>
                    <p
                      className={`mt-1 font-mono text-[11px] uppercase tracking-wide ${ACCENT_TEXT[a.accent]}`}
                    >
                      {a.domain}
                    </p>
                    <p className="mt-2 font-mono text-xs text-muted-dim">
                      {a.name}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 關鍵利益關係單位 ─────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <SectionLabel>關鍵夥伴 · Key Stakeholders</SectionLabel>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            海內外利益關係單位
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            以下名稱皆為 <strong className="text-gold">諧音 / 非正式代稱</strong>，
            僅示意關係定位，不代表任何實際合作、授權、代表或背書關係，
            亦未使用任何單位官方 LOGO。取得授權後將以正式單色 LOGO 替換。
          </p>

          {stakeholderCategories.map((cat) => (
            <div key={cat} className="mt-10">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {cat}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STAKEHOLDERS.filter((s) => s.category === cat).map((s) => (
                  <article
                    key={s.id}
                    className="flex items-start gap-4 rounded-card border border-line bg-surface p-5"
                  >
                    <div className={`shrink-0 ${ACCENT_TEXT[s.accent]}`}>
                      <StakeholderLogo
                        logo={s.logo}
                        alias={s.alias}
                        size={44}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-ink">
                          {s.alias}
                        </h4>
                        {s.homophone ? <SimBadge label="諧音" /> : null}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {s.relation}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 加入我們 / CTA ───────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <div className="rounded-card border border-line bg-surface p-8 md:p-10">
            <SectionLabel>一起共建 · Join us</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              想成為團隊成員或顧問？
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              我們正在組建跨品牌、ESG、AI 與資本領域的核心團隊與顧問網絡。
              歡迎來信，或加入社群一起把 AI 能見度量化變成產業標準。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:sall@symcio.tw?subject=Team%20%2F%20Advisor"
                className="inline-block rounded-card bg-accent px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-accent-dim"
              >
                來信洽談 →
              </a>
              <a
                href="https://discord.gg/jGWJr2Sd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-card border border-line px-6 py-3 text-sm font-semibold no-underline hover:border-accent hover:text-accent"
              >
                加入 Discord 社群
              </a>
              <Link
                href="/about"
                className="inline-block rounded-card border border-line px-6 py-3 text-sm font-semibold no-underline hover:border-accent hover:text-accent"
              >
                關於 Symcio
              </Link>
            </div>
          </div>

          {/* 籌備期聲明 */}
          <div className="mt-8 rounded-card border border-line bg-surface-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <SimBadge label="籌備期聲明" />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Symcio 為 BrandOS 方法論與工具的產品名稱；公司法人實體尚在登記籌備中。
              本頁所列職位（CEO / COO / CFO / CTO）、顧問與利益關係單位，
              於正式設立前皆為「模擬 / 示意」，名稱為諧音或非正式代稱，
              不構成任何聘任、合作、授權、代表或背書關係。
              所有內容將於法人成立、人員到任並取得單位授權後逐筆更新替換。
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
