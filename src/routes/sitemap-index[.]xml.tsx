import { createFileRoute } from "@tanstack/react-router";
import { ORIGIN } from "@/lib/pseo";


export const Route = createFileRoute("/sitemap-index.xml")({
  server: {
    handlers: {
      GET: () => {
        const lastmod = new Date().toISOString().slice(0, 10);
        const entries: string[] = [
          `  <sitemap><loc>${ORIGIN}/sitemap-core.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`,
          `  <sitemap><loc>${ORIGIN}/sitemaps/hub.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`,
          `  <sitemap><loc>${ORIGIN}/sitemaps/omegle.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`,
        ];


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
