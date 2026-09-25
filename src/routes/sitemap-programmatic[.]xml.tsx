// Programmatic sitemap INDEX: points to the chunked discover/directory
// sitemaps (2 500 URLs each) so no single file ever grows large enough to
// time out a crawler across the 100 000+ page matrix.

import { createFileRoute } from "@tanstack/react-router";
import { ORIGIN } from "@/lib/pseo";
import { freshLastmod } from "@/lib/pseoFresh";


export const Route = createFileRoute("/sitemap-programmatic.xml")({
  server: {
    handlers: {
      GET: () => {
        const lastmod = freshLastmod();
        const entries: string[] = [`  <sitemap><loc>${ORIGIN}/sitemap-core.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`];


        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>\n`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
