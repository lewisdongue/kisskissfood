import { createFileRoute } from "@tanstack/react-router";
import { HUB_PILLARS } from "@/data/hubPillars";
import { OMEGLE_LOCALES, omeglePath } from "@/data/omegleLocales";
import { LANGUAGE_BY_CODE, PSEO_LANGUAGES } from "@/data/pseoData";
import { ORIGIN, PERMUTATIONS_PER_LANG, iteratePermutations, isTier1, pseoUrl } from "@/lib/pseo";

const URLS_PER_SITEMAP = 2_500;
const DIRECTORY_PER_PAGE = 250;
const DIRECTORY_PAGES = Math.ceil(PERMUTATIONS_PER_LANG / DIRECTORY_PER_PAGE);

function xmlResponse(body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

function urlset(entries: string[]) {
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>`;
}

export const Route = createFileRoute("/sitemaps/$file")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const file = params.file;

        if (/^(directory|discover)-/.test(file)) return new Response("Gone", { status: 410 });
        const directoryMatch = /^directory-([a-z-]+)\.xml$/.exec(file);
        if (directoryMatch) {
          const lang = LANGUAGE_BY_CODE.get(directoryMatch[1]!);
          if (!lang) return new Response("Not found", { status: 404 });
          const entries: string[] = [];
          for (let page = 1; page <= DIRECTORY_PAGES; page++) {
            const loc = `${ORIGIN}/directory/${lang.code}/${page}`;
            const alternates = PSEO_LANGUAGES.map(
              (l) =>
                `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${ORIGIN}/directory/${l.code}/${page}" />`,
            ).join("\n");
            entries.push(
              `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.4</priority>\n${alternates}\n  </url>`,
            );
          }
          return xmlResponse(urlset(entries));
        }

        if (file === "omegle.xml") {
          const alternates = OMEGLE_LOCALES.map(
            (l) =>
              `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${ORIGIN}${omeglePath(l.code)}" />`,
          ).join("\n");
          const entries = OMEGLE_LOCALES.map(
            (l) =>
              `  <url>\n    <loc>${ORIGIN}${omeglePath(l.code)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${l.code === "en" ? "1.0" : "0.9"}</priority>\n${alternates}\n  </url>`,
          );
          return xmlResponse(urlset(entries));
        }

        if (file === "hub.xml") {
          const entries = HUB_PILLARS.map(
            (pillar) =>
              `  <url>\n    <loc>${ORIGIN}/en/discover/hub/${pillar.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
          );
          return xmlResponse(urlset(entries));
        }

        const discoverMatch = /^discover-([a-z-]+)-(\d+)\.xml$/.exec(file);
        if (discoverMatch) {
          const lang = LANGUAGE_BY_CODE.get(discoverMatch[1]!);
          const chunk = Number(discoverMatch[2]);
          if (!lang || !Number.isInteger(chunk) || chunk < 1) {
            return new Response("Not found", { status: 404 });
          }
          const from = (chunk - 1) * URLS_PER_SITEMAP;
          if (from >= PERMUTATIONS_PER_LANG) return new Response("Not found", { status: 404 });

          const entries: string[] = [];
          let index = from;
          for (const { category, location } of iteratePermutations(from, from + URLS_PER_SITEMAP)) {
            const loc = pseoUrl(lang.code, category.slug, location.slug);
            const alternates = PSEO_LANGUAGES.map(
              (l) =>
                `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${pseoUrl(l.code, category.slug, location.slug)}" />`,
            ).join("\n");
            entries.push(
              `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${isTier1(index) ? "daily" : "weekly"}</changefreq>\n    <priority>${isTier1(index) ? "0.8" : "0.5"}</priority>\n${alternates}\n  </url>`,
            );
            index++;
          }
          return xmlResponse(urlset(entries));
        }

        return new Response("Not found", { status: 404 });
      },
    },
  },
});
