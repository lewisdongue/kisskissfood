import { useState, type ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { ArrowLeft, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import type { FooterSeoPage } from "@/data/footerSeo";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildSoftwareJsonLd,
} from "@/data/footerSeo";
import InstantMatchWidget from "@/components/growth/InstantMatchWidget";
import DepthSections from "@/components/district/DepthSections";

// ═══════════════════════════════════════════════════════════════════════════
// DISTRICT PAGE — cinematic "Neo District" shell shared by every footer page.
// Provides: OLED atmosphere, HUD header, chromatic hero, telemetry strip,
// semantic SEO body (h2/h3), FAQ with JSON-LD, and a discreet conversion CTA.
// Purely presentational — wraps existing page logic untouched.
// ═══════════════════════════════════════════════════════════════════════════

type Props = {
  seo: FooterSeoPage;
  children?: ReactNode;
};

export default function DistrictPage({ seo, children }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="district-stage min-h-screen w-full overflow-x-hidden">
      {/* ── Atmosphere ── */}
      <div className="district-horizon" aria-hidden />
      <div className="district-scanlines" aria-hidden />
      <div className="district-sweep" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]"
        aria-hidden
      />

      {/* ── Structured data for search + AI answer engines ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(seo.faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(seo.eyebrow, seo.path)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSoftwareJsonLd()) }}
      />

      {/* ── HUD HEADER ── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hud-label line-clamp-1">{seo.eyebrow}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_3px_rgba(124,92,255,0.7)]" />
          </div>

          <Link
            to={seo.ctaTo}
            className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-200 transition-colors hover:bg-violet-500/20"
          >
            Start
          </Link>
        </div>
      </header>

      {/* ── CINEMATIC HERO ── */}
      <section className="relative z-10 mx-auto flex max-w-4xl flex-col px-4 pb-10 pt-3 text-center sm:px-6 sm:pt-16">
        <div className="order-2 mb-4 mt-7 flex justify-center sm:order-1 sm:mb-6 sm:mt-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
            <span className="hud-label">{seo.eyebrow}</span>
            <Sparkles className="h-3 w-3 text-violet-300/70" />
          </span>
        </div>

        <h1 className="chromatic-title order-3 text-[clamp(1.9rem,6.5vw,3.75rem)] font-black uppercase leading-[0.95] sm:order-2">
          {seo.h1}
        </h1>

        <p className="order-4 mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-white/50 sm:order-3">
          {seo.intro}
        </p>

        {/* Above-the-fold conversion widget */}
        <div className="order-1 mt-0 sm:order-4 sm:mt-8">
          <InstantMatchWidget />
        </div>

        {/* Telemetry strip */}
        <div className="order-5 mt-9 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          {seo.stats.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5 bg-black/60 px-2 py-4">
              <span className="font-mono text-lg font-black text-violet-200">{item.value}</span>
              <span className="hud-label line-clamp-1">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXISTING PAGE CONTENT ── */}
      {children ? (
        <div className="district-embed relative z-10 mx-auto w-full max-w-6xl px-0 sm:px-4">
          {children}
        </div>
      ) : null}

      {/* ── DEPTH LAYER (per-slug unique modules) ── */}
      <DepthSections path={seo.path} />

      {/* ── SEMANTIC AUTHORITY CONTENT ── */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-14 pt-14 sm:px-6">
        <div className="grid gap-5">
          {seo.sections.map((s) => (
            <article key={s.heading} className="holo-panel holo-corners relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
              <h2 className="mt-5 text-xl font-black tracking-tight text-white sm:text-2xl">
                {s.heading}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/55">{s.body}</p>
              {s.bullets ? (
                <ul className="mt-5 grid gap-2.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-white/65">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_2px_rgba(124,92,255,0.6)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* ── FAQ (AI answer-engine optimised) ── */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Frequently asked questions
          </h2>
          <span className="hud-label hidden sm:inline">Answers</span>
        </div>

        <div className="holo-panel relative overflow-hidden rounded-3xl">
          {seo.faq.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="border-b border-white/[0.06] last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-7 sm:py-5"
                >
                  <h3 className="text-[15px] font-bold text-white/90">{f.q}</h3>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-violet-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-white/55 sm:px-7 sm:pb-6">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DISCREET CONVERSION FUNNEL ── */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-24 text-center sm:px-6 sm:pb-28">
        <div className="rank-beam pointer-events-none absolute -inset-x-10 bottom-0 top-1/3" aria-hidden />
        <div className="holo-panel holo-corners relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10">
          <h2 className="chromatic-title text-[clamp(1.5rem,5vw,2.5rem)] font-black uppercase leading-[1]">
            {seo.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-white/50">{seo.ctaSub}</p>

          <div className="relative mt-9 inline-block">
            <div className="cta-aura absolute -inset-6 rounded-full" aria-hidden />
            <Link
              to={seo.ctaTo}
              className="cta-magnetic relative inline-flex items-center gap-3 rounded-2xl px-8 py-4.5 text-base font-black uppercase tracking-[0.12em]"
            >
              {seo.ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-white/30">
            Free · No download · 190+ countries
          </p>
        </div>
      </section>
    </div>
  );
}
