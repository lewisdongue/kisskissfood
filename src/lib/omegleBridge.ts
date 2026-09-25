// ═══════════════════════════════════════════════════════════════════════════
// OMEGLE-ALTERNATIVE ↔ PROGRAMMATIC MATRIX BRIDGE
// Bidirectional internal-link equity between the /omegle-alternative money
// page and the full /{lang}/discover/{category}/{location} matrix.
// Pure + deterministic: same slug pair always renders the same anchor.
// ═══════════════════════════════════════════════════════════════════════════

import {
  CATEGORY_BY_SLUG,
  LOCATION_BY_SLUG,
  PSEO_CATEGORIES,
  PSEO_LOCATIONS,
  type PseoCategory,
  type PseoLocation,
} from "@/data/pseoData";
import { categoryLabel, murmurHash3 } from "@/lib/pseo";
import type { BridgeCluster, BridgeLink } from "@/lib/hubBridge";

export const OMEGLE_PATH = "/omegle-alternative" as const;

/**
 * Anchor-text variants used by programmatic pages when linking UP to the
 * Omegle Alternative page. Rotated by slug hash so no two pages in the matrix
 * repeat the exact same anchor — natural link profile, zero footprint.
 */
const ANCHOR_TEMPLATES: ((c: string, l: string) => string)[] = [
  (c, l) => `Omegle alternative for ${c} in ${l}`,
  (c, l) => `the modern Omegle alternative used by ${c} around ${l}`,
  (c) => `a safer Omegle alternative built for ${c}`,
  (_c, l) => `why ${l} moved from Omegle to Caakus`,
  (c, l) => `Omegle replacement for ${c} near ${l}`,
  (c) => `free Omegle-style video chat for ${c}`,
  (_c, l) => `the Omegle alternative comparison for ${l}`,
  (c, l) => `how ${c} in ${l} replaced Omegle`,
];

const LEAD_TEMPLATES: ((c: string, l: string) => string)[] = [
  (c, l) =>
    `Omegle closed in 2023 and never came back. The ${c} community in ${l} needed the same one-tap, no-signup experience without the moderation gaps — that is exactly the gap Caakus fills.`,
  (c, l) =>
    `If you landed here after searching for an Omegle replacement, the short answer is yes: ${c} in ${l} get random browser-to-browser video matching, free, with no download.`,
  (c, l) =>
    `The habit Omegle created — open a tab, press start, meet someone — still exists among ${c} in ${l}. What changed is the infrastructure underneath it: encrypted peer-to-peer routing and active moderation.`,
  (c, l) =>
    `Most people reaching this ${l} page are comparing Omegle-style services. Side by side, the difference for ${c} is safety tooling, regional routing quality and a real identity of the community.`,
  (c, l) =>
    `Random video chat did not die with Omegle. For ${c} connecting from ${l}, the same spontaneity now runs on peer-to-peer WebRTC with age gating and abuse controls built in.`,
  (c, l) =>
    `Searching "Omegle alternative" from ${l} usually ends in ad-heavy clones. Caakus takes the opposite route for ${c}: no download, no paywall on matching, and moderation that actually responds.`,
];

export type OmegleBridgeCopy = {
  lead: string;
  anchor: string;
  secondary: string;
};

/** Contextual, non-duplicated copy for the "Omegle alternative" block. */
export function omegleBridgeCopy(
  category: PseoCategory,
  location: PseoLocation,
  lang = "en",
): OmegleBridgeCopy {
  const seed = murmurHash3(`omegle::${category.slug}::${location.slug}`);
  const c = categoryLabel(category, lang);
  const l = location.name;
  const lead = LEAD_TEMPLATES[seed % LEAD_TEMPLATES.length]!(c, l);
  const anchor = ANCHOR_TEMPLATES[(seed >>> 5) % ANCHOR_TEMPLATES.length]!(c, l);
  const secondary = `Full feature and safety comparison against Omegle, Chatroulette and Monkey — written for ${c}.`;
  return { lead, anchor, secondary };
}

// ── Omegle page → matrix (downward equity flow) ────────────────────────────

const TOP_CITY_SLUGS = [
  "new-york", "london", "los-angeles", "toronto", "sydney", "berlin",
  "paris", "madrid", "rome", "amsterdam", "warsaw", "istanbul",
  "tokyo", "seoul", "singapore", "manila", "jakarta", "mumbai",
  "delhi", "dubai", "lagos", "nairobi", "cairo", "johannesburg",
  "sao-paulo", "mexico-city", "buenos-aires", "bogota", "lima", "santiago",
  "chicago", "miami", "houston", "melbourne", "dublin", "lisbon",
];

const TOP_CATEGORY_SLUGS = [
  "new-friends", "gamers", "students", "language-partners",
  "english-practice", "travelers", "developers", "musicians",
  "night-owls", "creators", "expats", "anime-fans",
];

const cities = TOP_CITY_SLUGS
  .map((s) => LOCATION_BY_SLUG.get(s))
  .filter((l): l is PseoLocation => Boolean(l));

const categories = TOP_CATEGORY_SLUGS
  .map((s) => CATEGORY_BY_SLUG.get(s))
  .filter((c): c is PseoCategory => Boolean(c));

const CITY_POOL = cities.length ? cities : PSEO_LOCATIONS.slice(0, 36);
const CATEGORY_POOL = categories.length ? categories : PSEO_CATEGORIES.slice(0, 12);

function bridgeLink(lang: string, category: PseoCategory, location: PseoLocation): BridgeLink {
  return {
    lang,
    category: category.slug,
    location: location.slug,
    label: `${categoryLabel(category, lang)} in ${location.name}`,
  };
}

/**
 * Directory grid rendered inside the Omegle Alternative page.
 * 6 clusters × 6 links = 36 deep links into the matrix, deterministic order.
 */
export function omegleDirectoryClusters(lang = "en"): BridgeCluster[] {
  const seed = murmurHash3("omegle::directory");
  const clusters: BridgeCluster[] = [];
  const columns = 6;
  const perColumn = 6;

  for (let c = 0; c < columns; c++) {
    const category = CATEGORY_POOL[(seed + c * 3) % CATEGORY_POOL.length]!;
    const links: BridgeLink[] = [];
    for (let i = 0; links.length < perColumn && i < CITY_POOL.length; i++) {
      const city = CITY_POOL[(seed + c * 11 + i * 5) % CITY_POOL.length]!;
      if (links.some((l) => l.location === city.slug)) continue;
      links.push(bridgeLink(lang, category, city));
    }
    clusters.push({
      title: categoryLabel(category, lang).replace(/^./, (m) => m.toUpperCase()),
      links,
    });
  }

  return clusters;
}
