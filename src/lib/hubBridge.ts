// ═══════════════════════════════════════════════════════════════════════════
// HUB ↔ PROGRAMMATIC BRIDGE
// Builds the bidirectional internal-link pyramid between the 12 pillar hubs
// (/en/discover/hub/{slug}) and the programmatic matrix
// (/{lang}/discover/{category}/{location}). Pure, deterministic, SSR-safe.
// ═══════════════════════════════════════════════════════════════════════════

import {
  CATEGORY_BY_SLUG,
  LOCATION_BY_SLUG,
  PSEO_CATEGORIES,
  PSEO_LOCATIONS,
  type PseoCategory,
  type PseoLocation,
} from "@/data/pseoData";
import { HUB_BY_SLUG, HUB_PILLARS, type HubPillar } from "@/data/hubPillars";
import { categoryLabel, murmurHash3 } from "@/lib/pseo";

/** Major global hub cities used as the directory bridge anchors. */
const MAJOR_CITY_SLUGS = [
  "london", "new-york", "paris", "berlin", "madrid", "rome",
  "tokyo", "seoul", "singapore", "sydney", "toronto", "dubai",
  "mumbai", "delhi", "jakarta", "manila", "sao-paulo", "mexico-city",
  "lagos", "nairobi", "cairo", "johannesburg", "istanbul", "amsterdam",
];

/** Top interest categories used as the directory bridge anchors. */
const MAJOR_CATEGORY_SLUGS = [
  "students", "gamers", "language-partners", "travelers",
  "creators", "developers", "musicians", "new-friends",
  "english-practice", "expats", "night-owls", "entrepreneurs",
];

export const MAJOR_CITIES: PseoLocation[] = MAJOR_CITY_SLUGS
  .map((s) => LOCATION_BY_SLUG.get(s))
  .filter((l): l is PseoLocation => Boolean(l));

export const MAJOR_CATEGORIES: PseoCategory[] = MAJOR_CATEGORY_SLUGS
  .map((s) => CATEGORY_BY_SLUG.get(s))
  .filter((c): c is PseoCategory => Boolean(c));

export type BridgeLink = {
  lang: string;
  category: string;
  location: string;
  label: string;
};

export type BridgeCluster = {
  title: string;
  links: BridgeLink[];
};

function link(lang: string, category: PseoCategory, location: PseoLocation): BridgeLink {
  return {
    lang,
    category: category.slug,
    location: location.slug,
    label: `${categoryLabel(category, lang)} in ${location.name}`,
  };
}

/**
 * Directory clusters rendered at the bottom of a hub pillar page.
 * Deterministic per pillar slug: every hub exposes a different slice of the
 * matrix, so the 12 pillars together seed a wide, non-duplicated crawl surface.
 */
export function hubDirectoryClusters(pillarSlug: string, lang = "en"): BridgeCluster[] {
  const seed = murmurHash3(`hubdir::${pillarSlug}`);
  const cities = MAJOR_CITIES.length ? MAJOR_CITIES : PSEO_LOCATIONS.slice(0, 24);
  const categories = MAJOR_CATEGORIES.length ? MAJOR_CATEGORIES : PSEO_CATEGORIES.slice(0, 12);

  const clusters: BridgeCluster[] = [];
  const columns = 4;
  const perColumn = 6;

  for (let c = 0; c < columns; c++) {
    const category = categories[(seed + c * 5) % categories.length]!;
    const links: BridgeLink[] = [];
    for (let i = 0; i < perColumn; i++) {
      const city = cities[(seed + c * 7 + i * 3) % cities.length]!;
      if (links.some((l) => l.location === city.slug)) continue;
      links.push(link(lang, category, city));
    }
    clusters.push({
      title: categoryLabel(category, lang).replace(/^./, (m) => m.toUpperCase()),
      links,
    });
  }

  return clusters;
}

// ── Programmatic → hub backlinks ───────────────────────────────────────────

/** Editorial intent map: which pillar best answers each category's intent. */
const CATEGORY_INTENT: Record<string, string[]> = {
  developers: ["webrtc-browser-streaming", "global-p2p-video-network"],
  gamers: ["zero-latency-routing", "network-resilience-engineering"],
  streamers: ["realtime-data-infrastructure", "mobile-first-realtime-performance"],
  "language-partners": ["seamless-international-communication", "instant-global-matchmaking"],
  "english-practice": ["seamless-international-communication", "instant-global-matchmaking"],
  expats: ["seamless-international-communication", "virtual-community-engagement"],
  "students-abroad": ["seamless-international-communication", "virtual-community-engagement"],
  travelers: ["global-p2p-video-network", "seamless-international-communication"],
  students: ["virtual-community-engagement", "instant-global-matchmaking"],
  "study-buddies": ["virtual-community-engagement", "instant-global-matchmaking"],
  creators: ["points-recognition-architecture", "virtual-community-engagement"],
  entrepreneurs: ["points-recognition-architecture", "realtime-data-infrastructure"],
  "new-friends": ["instant-global-matchmaking", "trust-and-moderation-infrastructure"],
  "night-owls": ["network-resilience-engineering", "instant-global-matchmaking"],
  "late-night-talks": ["network-resilience-engineering", "realtime-privacy-and-security"],
  "coffee-chats": ["virtual-community-engagement", "instant-global-matchmaking"],
};

const FALLBACK_INTENT = [
  "instant-global-matchmaking",
  "global-p2p-video-network",
  "virtual-community-engagement",
];

/**
 * Hub pillars a programmatic page links back up to.
 * Always 4 unique, always existing slugs — no broken links, no DOM bloat.
 */
export function hubsForPseo(categorySlug: string, locationSlug: string, count = 4): HubPillar[] {
  const seed = murmurHash3(`hubup::${categorySlug}::${locationSlug}`);
  const ordered = [...(CATEGORY_INTENT[categorySlug] ?? []), ...FALLBACK_INTENT];

  const picked: HubPillar[] = [];
  const push = (slug: string) => {
    const pillar = HUB_BY_SLUG.get(slug);
    if (pillar && !picked.some((p) => p.slug === pillar.slug)) picked.push(pillar);
  };

  ordered.forEach(push);
  for (let i = 0; picked.length < count && i < HUB_PILLARS.length * 2; i++) {
    push(HUB_PILLARS[(seed + i) % HUB_PILLARS.length]!.slug);
  }

  return picked.slice(0, count);
}

/** Compact hub link set for the global footer. */
export function footerHubColumns(lang = "en"): BridgeCluster[] {
  const cities = MAJOR_CITIES.slice(0, 8);
  const categories = MAJOR_CATEGORIES.slice(0, 8);
  return [
    {
      title: "Popular cities",
      links: cities.map((city, i) => link(lang, categories[i % categories.length]!, city)),
    },
    {
      title: "Popular communities",
      links: categories.map((category, i) => link(lang, category, cities[(i + 3) % cities.length]!)),
    },
  ];
}
