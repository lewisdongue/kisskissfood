import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Globe2, Lock, ShieldCheck, X, Zap } from "lucide-react";
import type { OmegleLocale } from "@/data/omegleLocales";
import { OMEGLE_LOCALES, omeglePath } from "@/data/omegleLocales";
import type { BridgeCluster } from "@/lib/hubBridge";
import { HubLink, PseoLink } from "@/components/pseo/DirectoryBridge";
import { HUB_PILLARS } from "@/data/hubPillars";

// ═══════════════════════════════════════════════════════════════════════════
// Localized Omegle-alternative landing page.
// Pure server-rendered markup: no state, no effects, no client listeners.
// Everything above the fold ships in the first HTML response.
// ═══════════════════════════════════════════════════════════════════════════

const HUB_BRIDGE_SLUGS = [
  "instant-global-matchmaking",
  "global-p2p-video-network",
  "virtual-community-engagement",
  "language-exchange-network",
];

/**
 * Deterministic "users online" figure.
 * Derived from the language code + the current UTC hour so the number looks
 * alive across reloads yet renders identically on server and client — no
 * hydration mismatch, no client-side randomness, no layout shift.
 */
export function onlineCount(lang: string, hourStamp: number): number {
  let h = 2166136261 ^ hourStamp;
  for (let i = 0; i < lang.length; i++) {
    h ^= lang.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 15000 + (Math.abs(h) % 30001);
}

function CTA({ locale, count, id }: { locale: OmegleLocale; count: number; id?: string }) {
  return (
    <div id={id} className="flex flex-col items-center gap-3">
      <Link
        to="/call"
        className="cta-magnetic group inline-flex w-full max-w-md items-center justify-center gap-3 rounded-2xl px-7 py-5 text-center text-lg font-extrabold tracking-tight text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)] sm:text-xl"
      >
        <Zap className="h-5 w-5 shrink-0" aria-hidden />
        {locale.cta}
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
        <span className="relative flex h-2.5 w-2.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        {count.toLocaleString(locale.code)} {locale.onlineSuffix}
      </p>
      <p className="text-center text-xs text-white/45">{locale.ctaNote}</p>
    </div>
  );
}

function Badges({ locale }: { locale: OmegleLocale }) {
  const icons = [ShieldCheck, Lock, Globe2];
  return (
    <ul className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
      {locale.badges.map((badge, i) => {
        const Icon = icons[i] ?? ShieldCheck;
        return (
          <li
            key={badge}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-white/75"
          >
            <Icon className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
            {badge}
          </li>
        );
      })}
    </ul>
  );
}

export function LocalizedOmeglePage({
  locale,
  clusters,
  hourStamp,
}: {
  locale: OmegleLocale;
  clusters: BridgeCluster[];
  hourStamp: number;
}) {
  const count = onlineCount(locale.code, hourStamp);
  const hubs = HUB_PILLARS.filter((p) => HUB_BRIDGE_SLUGS.includes(p.slug));

  return (
    <main dir={locale.dir} lang={locale.code} className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">Caakus</p>
          <h1 className="mt-4 text-[30px] font-black leading-[1.12] tracking-tight sm:text-5xl">
            {locale.h1}
          </h1>
          <h2 className="mt-4 text-lg font-semibold leading-snug text-emerald-300 sm:text-2xl">
            {locale.h2}
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-white/70 sm:text-lg">
            {locale.intro}
          </p>
        </header>

        <section className="mt-8" aria-label={locale.cta}>
          <CTA locale={locale} count={count} id="start" />
          <Badges locale={locale} />
        </section>

        {/* ── Reddit pain points ───────────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="pains">
          <h2 id="pains" className="text-xl font-bold sm:text-2xl">
            {locale.h2}
          </h2>
          <ul className="mt-5 grid gap-3">
            {locale.pains.map((pain) => (
              <li
                key={pain}
                className="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] p-4"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                <p className="text-[15px] leading-relaxed text-white/75">{pain}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {locale.features.map((f) => (
            <article key={f.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-base font-bold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.d}</p>
            </article>
          ))}
        </section>

        {/* ── Mid-page CTA ─────────────────────────────────────────────── */}
        <section className="mt-14 rounded-3xl border border-violet-400/20 bg-violet-500/[0.06] p-6 sm:p-8">
          <CTA locale={locale} count={count} />
        </section>

        {/* ── Comparison ───────────────────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="compare">
          <h2 id="compare" className="text-xl font-bold sm:text-2xl">
            {locale.compareHeading}
          </h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full table-fixed text-left text-[13px] sm:text-sm">
              <thead className="bg-white/[0.05] text-white/60">
                <tr>
                  <th scope="col" className="w-2/5 p-3 font-semibold">
                    —
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    Omegle
                  </th>
                  <th scope="col" className="p-3 font-semibold text-emerald-300">
                    Caakus
                  </th>
                </tr>
              </thead>
              <tbody>
                {locale.rows.map((row) => (
                  <tr key={row.label} className="border-t border-white/8">
                    <th scope="row" className="p-3 font-medium text-white/70">
                      {row.label}
                    </th>
                    <td className="p-3 text-white/45">
                      <span className="inline-flex items-start gap-1.5">
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" aria-hidden />
                        {row.omegle}
                      </span>
                    </td>
                    <td className="p-3 text-white/80">
                      <span className="inline-flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
                        {row.caakus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-bold sm:text-2xl">
            {locale.faqHeading}
          </h2>
          <div className="mt-5 grid gap-3">
            {locale.faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-[15px] font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Downward link equity: 101k programmatic matrix ───────────── */}
        <section className="mt-14" aria-labelledby="directory">
          <h2 id="directory" className="text-xl font-bold sm:text-2xl">
            {locale.directoryHeading}
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
              <nav key={cluster.title} aria-label={cluster.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  {cluster.title}
                </h3>
                <ul className="mt-2.5 space-y-1.5">
                  {cluster.links.map((link) => (
                    <li key={`${link.category}-${link.location}`}>
                      <PseoLink
                        lang={link.lang}
                        category={link.category}
                        location={link.location}
                        className="text-sm text-white/60 transition-colors hover:text-emerald-300"
                      >
                        {link.label}
                      </PseoLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </section>

        {/* ── Upward link equity: core hubs ────────────────────────────── */}
        <section className="mt-12" aria-labelledby="hubs">
          <h2 id="hubs" className="text-xl font-bold sm:text-2xl">
            {locale.hubHeading}
          </h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {hubs.map((hub) => (
              <li key={hub.slug}>
                <HubLink
                  lang="en"
                  slug={hub.slug}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  {hub.h1}
                </HubLink>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="mt-14 rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-6 sm:p-8">
          <CTA locale={locale} count={count} />
        </section>

        {/* ── Language switcher (hreflang cluster in the DOM) ──────────── */}
        <nav className="mt-14 border-t border-white/10 pt-8" aria-labelledby="langs">
          <h2 id="langs" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
            {locale.langHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {OMEGLE_LOCALES.map((l) => (
              <li key={l.code}>
                <a
                  href={omeglePath(l.code)}
                  hrefLang={l.hreflang}
                  aria-current={l.code === locale.code ? "page" : undefined}
                  className={
                    l.code === locale.code
                      ? "text-sm font-semibold text-emerald-300"
                      : "text-sm text-white/55 transition-colors hover:text-white"
                  }
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
