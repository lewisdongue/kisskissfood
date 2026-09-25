import type { FooterSeoPage } from "@/data/footerSeo";

const ORIGIN = "https://www.caakus.com";
const OG_IMAGE = `${ORIGIN}/og-image.jpg`;

// Builds TanStack Router `head()` metadata from a footer SEO entry.
export function buildHead(seo: FooterSeoPage) {
  const url = `${ORIGIN}${seo.path}`;
  return () => ({
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { name: "keywords", content: seo.keywords },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Caakus" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: seo.h1 },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  });
}

// ── Self-referencing canonical for app routes ─────────────────────────────
// Every route must declare its own clean canonical URL (no query strings, no
// trailing slash) so Google never picks an arbitrary duplicate.
export function appHead(opts: {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}) {
  const url = `${ORIGIN}${opts.path}`;
  return () => ({
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      {
        name: "robots",
        content: opts.noindex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1",
      },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Caakus" },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  });
}
