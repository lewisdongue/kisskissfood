import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { BridgeCluster } from "@/lib/hubBridge";
import type { OmegleBridgeCopy } from "@/lib/omegleBridge";
import { PseoLink } from "@/components/pseo/DirectoryBridge";

// ═══════════════════════════════════════════════════════════════════════════
// Bidirectional bridge UI between /omegle-alternative and the matrix.
// Static markup, type-safe <Link>, zero client state.
// ═══════════════════════════════════════════════════════════════════════════

/** Contextual upward link rendered inside programmatic page copy. */
export function OmegleUpLink({ copy }: { copy: OmegleBridgeCopy }) {
  return (
    <section
      aria-labelledby="omegle-bridge"
      className="mt-12 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-5 sm:p-6"
    >
      <h2
        id="omegle-bridge"
        className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300/80"
      >
        Coming from Omegle?
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-white/70">{copy.lead}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/50">{copy.secondary}</p>
      <Link
        to="/omegle-alternative"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-400/70 hover:text-emerald-200"
      >
        {copy.anchor}
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
      </Link>
    </section>
  );
}

/** Downward directory grid rendered inside the Omegle Alternative page. */
export function OmegleDirectoryGrid({
  clusters,
  lang = "en",
}: {
  clusters: BridgeCluster[];
  lang?: string;
}) {
  return (
    <section
      aria-labelledby="omegle-directory"
      className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <h2
        id="omegle-directory"
        className="text-2xl font-black text-white sm:text-4xl"
      >
        Find your people, city by city
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
        Every community below is a live matching page. Pick the one closest to what you were
        looking for on Omegle, or browse the full directory.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {clusters.map((cluster) => (
          <div key={cluster.title} className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300/80">
              {cluster.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {cluster.links.map((l) => (
                <li key={`${l.category}-${l.location}`} className="min-w-0">
                  <PseoLink
                    lang={l.lang}
                    category={l.category}
                    location={l.location}
                    className="block truncate text-sm text-slate-400 transition-colors hover:text-white"
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
