import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, Globe2, Radio, ShieldCheck, Zap } from "lucide-react";
import { HUB_BY_SLUG, HUB_CTA_LABEL, HUB_CTA_NOTE, HUB_PILLARS, type HubPillar } from "@/data/hubPillars";
import { ORIGIN } from "@/lib/pseo";
import { hubDirectoryClusters } from "@/lib/hubBridge";
import { HubDirectoryGrid } from "@/components/pseo/DirectoryBridge";

// Isolated footer hub route: /{lang}/discover/hub/{slug}
// English is the single source of truth for these pillars, so only /en/ is
// indexable — other language codes resolve to not-found instead of duplicating.
const HUB_LANG = "en";

function hubPath(slug: string) {
  return `/${HUB_LANG}/discover/hub/${slug}`;
}

function hubUrl(slug: string) {
  return `${ORIGIN}${hubPath(slug)}`;
}

export const Route = createFileRoute("/$lang/discover/hub/$slug")({
  loader: ({ params }) => {
    if (params.lang !== HUB_LANG) throw notFound();
    const pillar = HUB_BY_SLUG.get(params.slug);
    if (!pillar) throw notFound();
    const related = pillar.related
      .map((slug) => HUB_BY_SLUG.get(slug))
      .filter((p): p is HubPillar => Boolean(p));
    return { pillar, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — Caakus" }, { name: "robots", content: "noindex" }] };
    }
    const { pillar } = loaderData;
    const url = hubUrl(pillar.slug);
    const image = "https://www.caakus.com/og-image.jpg";

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${url}#article`,
          headline: pillar.h1,
          description: pillar.description,
          inLanguage: "en",
          url,
          isPartOf: { "@id": `${ORIGIN}/#website` },
          about: pillar.clusters.map((c) => ({ "@type": "Thing", name: c.label })),
          articleSection: pillar.eyebrow,
          publisher: { "@type": "Organization", name: "Caakus", url: ORIGIN },
        },
        {
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: pillar.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Caakus", item: ORIGIN },
            { "@type": "ListItem", position: 2, name: "Discover Hub", item: `${ORIGIN}/${HUB_LANG}/discover/hub/${HUB_PILLARS[0]!.slug}` },
            { "@type": "ListItem", position: 3, name: pillar.h1, item: url },
          ],
        },
      ],
    };

    return {
      meta: [
        { title: pillar.title },
        { name: "description", content: pillar.description },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: pillar.title },
        { property: "og:description", content: pillar.description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Caakus" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: pillar.title },
        { name: "twitter:description", content: pillar.description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  pendingComponent: HubSkeleton,
  notFoundComponent: HubNotFound,
  component: HubPage,
});

function HubSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-10 w-full rounded-2xl bg-white/10" />
        <div className="h-10 w-3/4 rounded-2xl bg-white/10" />
        <div className="h-32 w-full rounded-3xl bg-white/[0.06]" />
        <div className="h-32 w-full rounded-3xl bg-white/[0.06]" />
        <div className="h-64 w-full rounded-3xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

function HubNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
      <h1 className="text-2xl font-bold">This hub page does not exist</h1>
      <a href={`/${HUB_LANG}/discover/hub/${HUB_PILLARS[0]!.slug}`} className="text-emerald-400 underline">
        Browse the Caakus discover hub
      </a>
    </main>
  );
}

function CtaBlock({ id, kicker }: { id: string; kicker: string }) {
  return (
    <div id={id} className="my-10 w-full">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
        {kicker}
      </p>
      <a
        href="/call"
        data-cta={id}
        className="cta-magnetic group relative flex w-full min-h-[120px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[2rem] px-5 py-8 text-center font-black sm:min-h-[148px] sm:px-12 sm:py-11"
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: "radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)" }} />
        <span className="relative flex flex-wrap items-center justify-center gap-3 text-[24px] leading-tight tracking-tight text-white sm:text-[38px]">
          {HUB_CTA_LABEL}
          <ArrowRight className="h-7 w-7 shrink-0 transition-transform group-hover:translate-x-1 sm:h-10 sm:w-10" />
        </span>
        <span className="relative text-[12px] font-bold uppercase tracking-[0.16em] text-white/70 sm:text-sm">
          {HUB_CTA_NOTE}
        </span>
      </a>
    </div>
  );
}

function HubPage() {
  const { pillar, related } = Route.useLoaderData();
  const directoryClusters = hubDirectoryClusters(pillar.slug, HUB_LANG);
  const midpoint = Math.ceil(pillar.sections.length / 2);
  const firstHalf = pillar.sections.slice(0, midpoint);
  const secondHalf = pillar.sections.slice(midpoint);

  const renderSection = (section: (typeof pillar.sections)[number]) => (
    <section key={section.heading} className="mt-10">
      <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">{section.heading}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-white/65">{section.body}</p>
      {section.bullets && (
        <ul className="mt-4 space-y-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-[14px] leading-relaxed text-white/60">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[820px] max-w-[160vw] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[160px]"
        aria-hidden
      />

      <header className="relative border-b border-white/[0.07] bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="/" className="text-sm font-black tracking-[0.2em] text-white">
            CAAKUS
          </a>
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
            REAL-TIME GLOBAL NETWORK
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.14em] text-white/35">
          <a href="/" className="hover:text-white">Caakus</a>
          <span className="px-2">/</span>
          <span className="text-white/50">Discover hub</span>
        </nav>

        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
          <Radio className="h-3.5 w-3.5" aria-hidden />
          {pillar.eyebrow}
        </p>

        <h1 className="mt-4 text-[28px] font-black leading-[1.1] tracking-tight sm:text-[44px]">{pillar.h1}</h1>

        <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-white/70">
          {pillar.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <CtaBlock id="cta-top" kicker="Start talking in one tap" />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <Zap className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> Sub-2s matching
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> Encrypted · 18+
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <Globe2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> 190+ countries
          </span>
        </div>

        <section aria-labelledby="key-figures" className="mt-10">
          <h2 id="key-figures" className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
            Key figures
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pillar.stats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <dt className="truncate text-[11px] uppercase tracking-[0.12em] text-white/40">{stat.label}</dt>
                <dd className="mt-1 break-words text-base font-bold text-emerald-400">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {firstHalf.map(renderSection)}

        <CtaBlock id="cta-mid" kicker="Put the theory on a live call" />

        {secondHalf.map(renderSection)}

        <section aria-labelledby="topic-map" className="mt-12">
          <h2 id="topic-map" className="text-xl font-bold text-white sm:text-2xl">
            Topic map
          </h2>
          <p className="mt-2 text-sm text-white/45">
            The subject areas this page covers, grouped by theme.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {pillar.clusters.map((cluster) => (
              <article key={cluster.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
                  {cluster.label}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cluster.terms.map((term) => (
                    <li
                      key={term}
                      className="max-w-full break-words rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-white/55"
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq" className="mt-12">
          <h2 id="faq" className="text-xl font-bold text-white sm:text-2xl">
            Frequently asked questions
          </h2>
          <div className="mt-5 space-y-3">
            {pillar.faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-base font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <CtaBlock id="cta-bottom" kicker="One tap to a real conversation" />

        <section aria-labelledby="related" className="mt-12">
          <h2 id="related" className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
            Continue in the hub
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <a
                key={item.slug}
                href={hubPath(item.slug)}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-emerald-400/40"
              >
                <span className="block text-[10px] uppercase tracking-[0.14em] text-emerald-300/80">{item.eyebrow}</span>
                <span className="mt-1 block text-sm font-semibold leading-snug text-white">{item.h1}</span>
              </a>
            ))}
          </div>
        </section>

        <HubDirectoryGrid clusters={directoryClusters} lang={HUB_LANG} />

        <nav aria-label="All hub pillars" className="mt-12 border-t border-white/[0.07] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">All hub pillars</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {HUB_PILLARS.map((item) => (
              <li key={item.slug} className="min-w-0">
                <a
                  href={hubPath(item.slug)}
                  aria-current={item.slug === pillar.slug ? "page" : undefined}
                  className={`block truncate text-sm ${
                    item.slug === pillar.slug ? "text-emerald-400" : "text-white/55 hover:text-white"
                  }`}
                >
                  {item.eyebrow} — {item.title.replace(" | Caakus", "")}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
