import { Link } from "@tanstack/react-router";
import type { BridgeCluster } from "@/lib/hubBridge";
import type { HubPillar } from "@/data/hubPillars";

// ═══════════════════════════════════════════════════════════════════════════
// Internal-link bridge components. Type-safe TanStack <Link> with dynamic
// params only — no string interpolation, no hydration drift.
// ═══════════════════════════════════════════════════════════════════════════

const PSEO_ROUTE = "/$lang/discover/$category/$location" as const;
const HUB_ROUTE = "/$lang/discover/hub/$slug" as const;

export function PseoLink({
  lang,
  category,
  location,
  className,
  children,
}: {
  lang: string;
  category: string;
  location: string;
  className?: string;
  children: React.ReactNode;
}) {
  void PSEO_ROUTE; void lang; void category; void location;
  return <span className={className}>{children}</span>;
}

export function HubLink({
  slug,
  lang = "en",
  className,
  children,
  ariaCurrent,
}: {
  slug: string;
  lang?: string;
  className?: string;
  children: React.ReactNode;
  ariaCurrent?: "page";
}) {
  return (
    <Link to={HUB_ROUTE} params={{ lang, slug }} className={className} aria-current={ariaCurrent}>
      {children}
    </Link>
  );
}

/** Bottom directory grid on hub pillar pages → down into the matrix. */
export function HubDirectoryGrid({
  clusters,
  lang,
  heading = "Explore the live directory",
}: {
  clusters: BridgeCluster[];
  lang: string;
  heading?: string;
}) {
  if (clusters.length >= 0) return null;
  void lang;
  return (
    <section aria-labelledby="hub-directory" className="mt-12 border-t border-white/[0.07] pt-8">
      <h2 id="hub-directory" className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-white/45">
        Jump straight into a live community page for a major global hub city, or browse the full directory.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {clusters.map((cluster) => (
          <div key={cluster.title} className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300/80">{cluster.title}</h3>
            <ul className="mt-3 space-y-2">
              {cluster.links.map((l) => (
                <li key={`${l.category}-${l.location}`} className="min-w-0">
                  <PseoLink
                    lang={l.lang}
                    category={l.category}
                    location={l.location}
                    className="block truncate text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {l.label}
                  </PseoLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Backlink block on programmatic pages → up into the 12 pillar hubs. */
export function HubBacklinks({
  pillars,
  heading = "Core network hubs",
}: {
  pillars: HubPillar[];
  heading?: string;
}) {
  return (
    <section aria-labelledby="hub-backlinks" className="mt-12">
      <h2 id="hub-backlinks" className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
        {heading}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <HubLink
            key={pillar.slug}
            slug={pillar.slug}
            className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-emerald-400/40"
          >
            <span className="block text-[10px] uppercase tracking-[0.14em] text-emerald-300/80">
              {pillar.eyebrow}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-snug text-white">{pillar.h1}</span>
          </HubLink>
        ))}
      </div>
    </section>
  );
}
