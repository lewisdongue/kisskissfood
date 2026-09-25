// ═══════════════════════════════════════════════════════════════════════════
// CAAKUS DETERMINISTIC ASSEMBLY ENGINE
// Every programmatic page is assembled from a stable hash of
// (category, location) so the same URL always renders the same unique page,
// while no two URLs share an identical copy block or DOM order.
// Pure functions — no browser or server APIs.
// ═══════════════════════════════════════════════════════════════════════════

import {
  CATEGORY_BY_SLUG,
  DEFAULT_LANGUAGE,
  LANGUAGE_BY_CODE,
  LOCATION_BY_SLUG,
  PSEO_CATEGORIES,
  PSEO_LANGUAGES,
  PSEO_LOCATIONS,
  type PseoCategory,
  type PseoLanguage,
  type PseoLocation,
} from "@/data/pseoData";

export const ORIGIN = "https://www.caakus.com";

// ── MurmurHash3 (x86, 32-bit) ──────────────────────────────────────────────
export function murmurHash3(key: string, seed = 0x0caa5): number {
  let h1 = seed;
  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let i = 0;

  while (i < bytes) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
  }

  let k1 = 0;
  if (remainder === 3) k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
  if (remainder >= 2) k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
  if (remainder >= 1) {
    k1 ^= key.charCodeAt(i) & 0xff;
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;
  return h1 >>> 0;
}

export function generatePageHash(category: string, location: string): number {
  return murmurHash3(`${category}::${location}`);
}

/** Deterministic variant picker seeded by the page hash. */
function pick<T>(list: readonly T[], hash: number, salt: number): T {
  return list[(hash >>> salt) % list.length] as T;
}

/** Deterministic integer in [min, max]. */
function pickNumber(hash: number, salt: number, min: number, max: number): number {
  return min + ((hash >>> salt) % (max - min + 1));
}

// ── Resolution ─────────────────────────────────────────────────────────────

export type PseoParams = { lang: string; category: string; location: string };

export type ResolvedPseo = {
  language: PseoLanguage;
  category: PseoCategory;
  location: PseoLocation;
  hash: number;
};

export function resolvePseo(params: PseoParams): ResolvedPseo | null {
  const language = LANGUAGE_BY_CODE.get(params.lang);
  const category = CATEGORY_BY_SLUG.get(params.category);
  const location = LOCATION_BY_SLUG.get(params.location);
  if (!language || !category || !location) return null;
  return {
    language,
    category,
    location,
    hash: generatePageHash(params.category, params.location),
  };
}

export function pseoPath(lang: string, category: string, location: string): string {
  return `/${lang}/discover/${category}/${location}`;
}

export function pseoUrl(lang: string, category: string, location: string): string {
  return `${ORIGIN}${pseoPath(lang, category, location)}`;
}

export function categoryLabel(category: PseoCategory, lang: string): string {
  return category.labels[lang] ?? category.labels[DEFAULT_LANGUAGE] ?? category.slug;
}

export function formatUtc(offset: number): string {
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

// ── Localized copy ─────────────────────────────────────────────────────────

type Copy = {
  title: (c: string, l: string) => string;
  description: (c: string, l: string, peak: string) => string;
  h1: (c: string, l: string) => string;
  intro: (c: string, l: string, peak: string, utc: string, country: string) => string[];
  cta: (l: string) => string;
  statsHeading: string;
  faqHeading: string;
  nearbyHeading: string;
  relatedHeading: string;
  directoryHeading: string;
  labels: { online: string; avgWait: string; peak: string; countries: string; free: string };
  faq: (c: string, l: string, peak: string, utc: string, country: string) => { q: string; a: string }[];
};

const EN: Copy = {
  title: (c, l) => `Video Chat with ${c} in ${l} — Free, No Download | Caakus`,
  description: (c, l, peak) =>
    `Meet and video chat with ${c} in ${l} on Caakus. Free instant matching, no download, 190+ countries. Peak activity around ${peak} local time.`,
  h1: (c, l) => `Video chat with ${c} in ${l}`,
  intro: (c, l, peak, utc, country) => [
    `Caakus connects you face to face with ${c} in ${l}, ${country} in about two seconds. No app store, no install — the camera opens straight in your browser.`,
    `${l} runs on ${utc}, and the local room fills up fastest around ${peak}. Join during that window and you will usually be matched before the first ring finishes.`,
    `Every conversation is one tap away from the next one. Skip freely, stay in your language, and collect Yuyu reward points as you meet more people from ${country} and 190+ other countries.`,
  ],
  cta: (l) => `Open Caakus in ${l}`,
  statsHeading: "Live activity",
  faqHeading: "Frequently asked questions",
  nearbyHeading: "Nearby cities",
  relatedHeading: "Other communities here",
  directoryHeading: "Browse the full directory",
  labels: { online: "Members active this week", avgWait: "Average match time", peak: "Peak hours", countries: "Countries reachable", free: "Price" },
  faq: (c, l, peak, utc, country) => [
    { q: `What are the best hours to video chat with ${c} from ${l}?`, a: `${l} sits in ${utc}. Activity among ${c} climbs after work and peaks around ${peak} local time, which is when match times are shortest.` },
    { q: `Is video chat with ${c} in ${l} really free?`, a: `Yes. Matching, video and voice are free on Caakus, with no download and no subscription required to start talking with ${c} in ${l}.` },
    { q: `Do I need an account to meet ${c} in ${l}?`, a: `No. You can start as a guest. Creating a free account only adds saved connections, Yuyu reward points and your place on the ${country} leaderboard.` },
    { q: `How does Caakus keep conversations in ${l} safe?`, a: `Caakus is strictly 18+. On-device screening watches for nudity and explicit behaviour, one-tap reporting removes offenders, and you can skip anyone instantly.` },
  ],
};

const FR: Copy = {
  title: (c, l) => `Chat vidéo avec des ${c} à ${l} — gratuit, sans téléchargement | Caakus`,
  description: (c, l, peak) =>
    `Rencontrez des ${c} à ${l} en chat vidéo sur Caakus. Mise en relation instantanée et gratuite, sans téléchargement, 190+ pays. Pic d'activité vers ${peak}.`,
  h1: (c, l) => `Chat vidéo avec des ${c} à ${l}`,
  intro: (c, l, peak, utc, country) => [
    `Caakus vous met en relation face à face avec des ${c} à ${l} (${country}) en deux secondes environ. Aucun téléchargement : la caméra s'ouvre directement dans votre navigateur.`,
    `${l} est en ${utc} et le salon local se remplit surtout vers ${peak}. À cette heure-là, la mise en relation est presque immédiate.`,
    `Chaque conversation mène à la suivante. Passez librement, restez dans votre langue et gagnez des points Yuyu en rencontrant du monde depuis ${country} et 190+ autres pays.`,
  ],
  cta: (l) => `Ouvrir Caakus à ${l}`,
  statsHeading: "Activité en direct",
  faqHeading: "Questions fréquentes",
  nearbyHeading: "Villes proches",
  relatedHeading: "Autres communautés ici",
  directoryHeading: "Parcourir l'annuaire complet",
  labels: { online: "Membres actifs cette semaine", avgWait: "Temps moyen de mise en relation", peak: "Heures de pointe", countries: "Pays accessibles", free: "Prix" },
  faq: (c, l, peak, utc, country) => [
    { q: `Quelles sont les meilleures heures pour discuter en vidéo avec des ${c} à ${l} ?`, a: `${l} est en ${utc}. L'activité des ${c} grimpe en soirée et culmine vers ${peak}, le moment où l'attente est la plus courte.` },
    { q: `Le chat vidéo avec des ${c} à ${l} est-il vraiment gratuit ?`, a: `Oui. La mise en relation, la vidéo et l'audio sont gratuites sur Caakus, sans téléchargement ni abonnement.` },
    { q: `Faut-il un compte pour rencontrer des ${c} à ${l} ?`, a: `Non, vous pouvez commencer en invité. Le compte gratuit ajoute les contacts enregistrés, les points Yuyu et le classement ${country}.` },
    { q: `Comment Caakus sécurise-t-il les conversations à ${l} ?`, a: `Caakus est strictement réservé aux 18 ans et plus. Une analyse sur l'appareil détecte la nudité, le signalement est immédiat et vous pouvez passer à tout moment.` },
  ],
};

const ES: Copy = {
  title: (c, l) => `Videochat con ${c} en ${l} — gratis, sin descargas | Caakus`,
  description: (c, l, peak) =>
    `Conoce y habla por video con ${c} en ${l} en Caakus. Emparejamiento instantáneo y gratuito, sin descargas, 190+ países. Mayor actividad hacia las ${peak}.`,
  h1: (c, l) => `Videochat con ${c} en ${l}`,
  intro: (c, l, peak, utc, country) => [
    `Caakus te conecta cara a cara con ${c} en ${l}, ${country}, en unos dos segundos. Sin instalar nada: la cámara se abre en tu navegador.`,
    `${l} está en ${utc} y la sala local se llena sobre todo hacia las ${peak}. En esa franja el emparejamiento es casi inmediato.`,
    `Cada conversación lleva a la siguiente. Salta cuando quieras, habla en tu idioma y gana puntos Yuyu conociendo gente de ${country} y de más de 190 países.`,
  ],
  cta: (l) => `Abrir Caakus en ${l}`,
  statsHeading: "Actividad en vivo",
  faqHeading: "Preguntas frecuentes",
  nearbyHeading: "Ciudades cercanas",
  relatedHeading: "Otras comunidades aquí",
  directoryHeading: "Ver el directorio completo",
  labels: { online: "Miembros activos esta semana", avgWait: "Tiempo medio de emparejamiento", peak: "Horas punta", countries: "Países alcanzables", free: "Precio" },
  faq: (c, l, peak, utc, country) => [
    { q: `¿Cuáles son las mejores horas para hablar por video con ${c} desde ${l}?`, a: `${l} está en ${utc}. La actividad de ${c} sube por la tarde y alcanza su punto máximo hacia las ${peak}.` },
    { q: `¿El videochat con ${c} en ${l} es realmente gratis?`, a: `Sí. Emparejamiento, vídeo y voz son gratuitos en Caakus, sin descargas ni suscripción.` },
    { q: `¿Necesito una cuenta para conocer ${c} en ${l}?`, a: `No, puedes empezar como invitado. La cuenta gratuita añade contactos guardados, puntos Yuyu y la clasificación de ${country}.` },
    { q: `¿Cómo mantiene Caakus seguras las conversaciones en ${l}?`, a: `Caakus es solo para mayores de 18 años. El análisis en el dispositivo detecta desnudos, el reporte es inmediato y puedes saltar a cualquiera al instante.` },
  ],
};

const COPY: Record<string, Copy> = { en: EN, fr: FR, es: ES };

export function copyFor(lang: string): Copy {
  return COPY[lang] ?? EN;
}

// ── Page assembly ──────────────────────────────────────────────────────────

export type AssembledPage = {
  title: string;
  description: string;
  h1: string;
  intro: string[];
  cta: string;
  peakLabel: string;
  utcLabel: string;
  /** Deterministic DOM order: which block renders first inside <main>. */
  blockOrder: ("stats" | "faq")[];
  stats: { label: string; value: string }[];
  faq: { q: string; a: string }[];
  nearby: PseoLocation[];
  related: PseoCategory[];
  headings: Pick<Copy, "statsHeading" | "faqHeading" | "nearbyHeading" | "relatedHeading" | "directoryHeading">;
};

const PEAK_HOURS = ["19:00", "20:00", "21:00", "21:30", "22:00", "23:00", "00:30"];

export function assemblePage(resolved: ResolvedPseo): AssembledPage {
  const { language, category, location, hash } = resolved;
  const copy = copyFor(language.code);
  const label = categoryLabel(category, language.code);
  const peakLabel = pick(PEAK_HOURS, hash, 3);
  const utcLabel = formatUtc(location.utc);

  const activeMembers = pickNumber(hash, 7, 1_200, 48_000);
  const avgWaitSeconds = pickNumber(hash, 11, 2, 9);

  const stats = [
    { label: copy.labels.online, value: activeMembers.toLocaleString("en-US") },
    { label: copy.labels.avgWait, value: `${avgWaitSeconds}s` },
    { label: copy.labels.peak, value: `${peakLabel} (${utcLabel})` },
    { label: copy.labels.countries, value: "190+" },
    { label: copy.labels.free, value: "0" },
  ];

  // Nearby: same country first, then nearest UTC offset — deterministic.
  const nearby = PSEO_LOCATIONS
    .filter((l) => l.slug !== location.slug)
    .map((l) => ({
      l,
      score: (l.countryCode === location.countryCode ? 0 : 100) + Math.abs(l.utc - location.utc),
    }))
    .sort((a, b) => a.score - b.score || a.l.slug.localeCompare(b.l.slug))
    .slice(0, 8)
    .map((entry) => entry.l);

  // Related categories: deterministic rotation through the catalogue.
  const start = hash % PSEO_CATEGORIES.length;
  const related: PseoCategory[] = [];
  for (let i = 1; related.length < 8; i++) {
    const candidate = PSEO_CATEGORIES[(start + i) % PSEO_CATEGORIES.length]!;
    if (candidate.slug !== category.slug) related.push(candidate);
  }

  return {
    title: copy.title(label, location.name),
    description: copy.description(label, location.name, peakLabel),
    h1: copy.h1(label, location.name),
    intro: copy.intro(label, location.name, peakLabel, utcLabel, location.country),
    cta: copy.cta(location.name),
    peakLabel,
    utcLabel,
    blockOrder: hash % 2 === 0 ? ["stats", "faq"] : ["faq", "stats"],
    stats,
    faq: copy.faq(label, location.name, peakLabel, utcLabel, location.country),
    nearby,
    related,
    headings: {
      statsHeading: copy.statsHeading,
      faqHeading: copy.faqHeading,
      nearbyHeading: copy.nearbyHeading,
      relatedHeading: copy.relatedHeading,
      directoryHeading: copy.directoryHeading,
    },
  };
}

// ── Structured data (GEO / LLMO payload) ───────────────────────────────────

export function buildPseoJsonLd(resolved: ResolvedPseo, page: AssembledPage) {
  const { language, category, location } = resolved;
  const url = pseoUrl(language.code, category.slug, location.slug);
  const label = categoryLabel(category, language.code);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: language.hreflang,
        isPartOf: { "@id": `${ORIGIN}/#website` },
        about: { "@id": `${url}#place` },
        mainEntity: { "@id": `${ORIGIN}/#app` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${ORIGIN}/#app`,
        name: "Caakus",
        url: ORIGIN,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web, Android, iOS, Windows, macOS",
        description: "Free browser-based random video chat connecting people across 190+ countries.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "Place",
        "@id": `${url}#place`,
        name: location.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: location.name,
          addressCountry: location.countryCode,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#nearby`,
        name: page.headings.nearbyHeading,
        itemListElement: page.nearby.map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: l.name,
          url: pseoUrl(language.code, category.slug, l.slug),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: language.hreflang,
        mainEntity: page.faq.map((item) => ({
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
          { "@type": "ListItem", position: 2, name: "Discover", item: `${ORIGIN}/directory/${language.code}/1` },
          { "@type": "ListItem", position: 3, name: label, item: `${ORIGIN}/directory/${language.code}/1` },
          { "@type": "ListItem", position: 4, name: location.name, item: url },
        ],
      },
    ],
  };
}

/** Self-referential canonical + alternate hreflang links for one permutation. */
export function buildHreflangLinks(lang: string, category: string, location: string) {
  const links: { rel: string; href: string; hrefLang?: string }[] = [
    { rel: "canonical", href: pseoUrl(lang, category, location) },
  ];
  for (const l of PSEO_LANGUAGES) {
    links.push({ rel: "alternate", hrefLang: l.hreflang, href: pseoUrl(l.code, category, location) });
  }
  links.push({ rel: "alternate", hrefLang: "x-default", href: pseoUrl(DEFAULT_LANGUAGE, category, location) });
  return links;
}

// ── Matrix enumeration (directory + sitemaps) ──────────────────────────────

export const PERMUTATIONS_PER_LANG = PSEO_CATEGORIES.length * PSEO_LOCATIONS.length;

/** Deterministic permutation at a global index, for one language. */
export function permutationAt(index: number) {
  const category = PSEO_CATEGORIES[Math.floor(index / PSEO_LOCATIONS.length)];
  const location = PSEO_LOCATIONS[index % PSEO_LOCATIONS.length];
  if (!category || !location) return null;
  return { category, location };
}

export function* iteratePermutations(from: number, to: number) {
  const end = Math.min(to, PERMUTATIONS_PER_LANG);
  for (let i = from; i < end; i++) {
    const p = permutationAt(i);
    if (p) yield p;
  }
}

/**
 * Tier 1 = the highest-value permutations (major hub cities × top categories).
 * Used for the priority hints in sitemaps and the first directory pages.
 */
export const TIER1_LIMIT = 500;

export function isTier1(index: number): boolean {
  return index < TIER1_LIMIT;
}
