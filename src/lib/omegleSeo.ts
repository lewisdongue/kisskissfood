import { OMEGLE_DEFAULT_LOCALE, OMEGLE_LOCALES, omeglePath, type OmegleLocale } from "@/data/omegleLocales";
import { ORIGIN } from "@/lib/pseo";

const OG_IMAGE = `${ORIGIN}/og-image.jpg`;

/** Canonical + full hreflang cluster for every localized variant. */
export function omegleAlternateLinks(lang: string) {
  const links: { rel: string; href: string; hrefLang?: string }[] = [
    { rel: "canonical", href: `${ORIGIN}${omeglePath(lang)}` },
  ];
  for (const l of OMEGLE_LOCALES) {
    links.push({ rel: "alternate", hrefLang: l.hreflang, href: `${ORIGIN}${omeglePath(l.code)}` });
  }
  links.push({ rel: "alternate", hrefLang: "x-default", href: `${ORIGIN}${omeglePath(OMEGLE_DEFAULT_LOCALE)}` });
  return links;
}

/** Localized TanStack `head()` payload for one language variant. */
export function buildOmegleHead(locale: OmegleLocale) {
  const url = `${ORIGIN}${omeglePath(locale.code)}`;
  return {
    meta: [
      { title: locale.title },
      { name: "description", content: locale.description },
      { name: "keywords", content: locale.keywords },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:title", content: locale.title },
      { property: "og:description", content: locale.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Caakus" },
      { property: "og:locale", content: locale.code },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: locale.h1 },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: locale.title },
      { name: "twitter:description", content: locale.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: omegleAlternateLinks(locale.code),
  };
}

/** Localized FAQPage + WebApplication + BreadcrumbList graph. */
export function buildOmegleJsonLd(locale: OmegleLocale, url: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: "Caakus",
        url,
        inLanguage: locale.hreflang,
        applicationCategory: "CommunicationApplication",
        operatingSystem: "Web browser",
        browserRequirements: "Requires WebRTC support",
        description: locale.description,
        featureList: locale.features.map((f) => f.t),
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: "Caakus", url: ORIGIN },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: locale.hreflang,
        mainEntity: locale.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Caakus", "@id": `${ORIGIN}/`, item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: locale.h1, "@id": url, item: url },
        ],
      },
    ],
  };
}
