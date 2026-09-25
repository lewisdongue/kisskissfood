// ═══════════════════════════════════════════════════════════════════════════
// FOOTPRINT BREAKING
// Programmatic pages must not share one identical DOM skeleton. The niche
// decides one of three structural variants, and a deterministic hash of the
// slug pair permutes the order of the secondary sections. Same URL → same
// DOM (crawl-stable); different URL → physically different DOM tree.
// ═══════════════════════════════════════════════════════════════════════════

import { murmurHash3 } from "@/lib/pseo";

export type LayoutVariant = "editorial" | "dashboard" | "split";

/** Niche families mapped to a structural variant. */
const VARIANT_BY_CATEGORY: Record<string, LayoutVariant> = {
  gamers: "dashboard",
  "night-owls": "dashboard",
  creators: "dashboard",
  students: "editorial",
  "language-partners": "editorial",
  artists: "editorial",
  musicians: "split",
  travelers: "split",
};

export function layoutVariant(categorySlug: string): LayoutVariant {
  const mapped = VARIANT_BY_CATEGORY[categorySlug];
  if (mapped) return mapped;
  const variants: LayoutVariant[] = ["editorial", "dashboard", "split"];
  return variants[murmurHash3(`variant|${categorySlug}`) % 3]!;
}

export type SectionKey =
  | "faq"
  | "activity"
  | "leaderboard"
  | "nearby"
  | "depth"
  | "tool"
  | "stats"
  | "bridge";

const SECONDARY: SectionKey[] = [
  "faq",
  "activity",
  "leaderboard",
  "nearby",
  "depth",
  "tool",
  "stats",
  "bridge",
];

/**
 * Deterministic Fisher-Yates driven by the slug hash: a stable but
 * URL-specific permutation of the secondary sections.
 */
export function sectionOrder(categorySlug: string, locationSlug: string): SectionKey[] {
  const out = [...SECONDARY];
  for (let i = out.length - 1; i > 0; i--) {
    const j = murmurHash3(`${categorySlug}/${locationSlug}/order/${i}`) % (i + 1);
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** Per-variant wrapper classes so the rendered markup differs structurally. */
export const VARIANT_CLASSES: Record<
  LayoutVariant,
  { main: string; hero: string; section: string; heading: string }
> = {
  editorial: {
    main: "relative mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6",
    hero: "border-l-2 border-emerald-400/50 pl-4",
    section: "mt-14",
    heading: "text-xl font-bold leading-snug text-white sm:text-2xl",
  },
  dashboard: {
    main: "relative mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6",
    hero: "rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8",
    section: "mt-10",
    heading: "text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300/80",
  },
  split: {
    main: "relative mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6",
    hero: "grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start",
    section: "mt-12",
    heading: "text-lg font-bold text-white sm:text-xl",
  },
};
