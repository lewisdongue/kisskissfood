import { PSEO_CATEGORIES, PSEO_LOCATIONS, type PseoLanguage } from "@/data/pseoData";
import { categoryLabel, murmurHash3, pseoPath } from "@/lib/pseo";

// ═══════════════════════════════════════════════════════════════════════════
// ICEBERG LINKS — deep internal linking surface.
// The selection rotates every hour (deterministically, identical on server and
// client within the same hour) so crawlers keep discovering fresh deep URLs
// without any layout shift or client-side fetching.
// ═══════════════════════════════════════════════════════════════════════════

type Props = {
  language: PseoLanguage;
  /** Hour bucket — passed from the loader so SSR and hydration agree. */
  hourSeed: number;
  currentCategory?: string;
  currentLocation?: string;
  heading: string;
  count?: number;
};

export default function IcebergLinks({
  language,
  hourSeed,
  currentCategory,
  currentLocation,
  heading,
  count = 24,
}: Props) {
  const seed = murmurHash3(`iceberg::${language.code}::${hourSeed}`);
  const links: { href: string; label: string }[] = [];

  for (let i = 0; links.length < count; i++) {
    const category = PSEO_CATEGORIES[(seed + i * 7) % PSEO_CATEGORIES.length]!;
    const location = PSEO_LOCATIONS[(seed + i * 31) % PSEO_LOCATIONS.length]!;
    if (category.slug === currentCategory && location.slug === currentLocation) continue;
    const href = pseoPath(language.code, category.slug, location.slug);
    if (links.some((l) => l.href === href)) continue;
    links.push({
      href,
      label: `${categoryLabel(category, language.code)} · ${location.name}`,
    });
  }

  return (
    <nav aria-label={heading} className="mt-12">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">{heading}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-emerald-400/40 hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
