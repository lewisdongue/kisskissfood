// Core sitemap: editorial + landing routes only. Kept small and fast so
// crawlers never time out on the human-authored part of the site.

import { createFileRoute } from "@tanstack/react-router";
import { HUB_PILLARS } from "@/data/hubPillars";
import { OMEGLE_LOCALES, omeglePath } from "@/data/omegleLocales";
import { MICRO_TOOLS } from "@/data/microTools";
import { PSEO_LOCATIONS } from "@/data/pseoData";
import { ORIGIN } from "@/lib/pseo";
import { freshLastmod } from "@/lib/pseoFresh";

const CORE_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/omegle-alternative", priority: "1.0", changefreq: "daily" },
  { path: "/chatroulette-alternative", priority: "0.9", changefreq: "weekly" },
  { path: "/monkey-app-alternative", priority: "0.9", changefreq: "weekly" },
  { path: "/azar-alternative", priority: "0.9", changefreq: "weekly" },
  { path: "/ometv-alternative", priority: "0.8", changefreq: "weekly" },
  { path: "/coomeet-alternative", priority: "0.8", changefreq: "weekly" },
  { path: "/random-video-chat", priority: "0.9", changefreq: "weekly" },
  { path: "/talk-to-strangers", priority: "0.8", changefreq: "weekly" },
  { path: "/anonymous-webcam-chat", priority: "0.8", changefreq: "weekly" },
  { path: "/face-to-face-random-chat", priority: "0.8", changefreq: "weekly" },
  { path: "/no-signup-video-match", priority: "0.8", changefreq: "weekly" },
  { path: "/meet-new-people", priority: "0.8", changefreq: "weekly" },
  { path: "/safe-chat-with-strangers", priority: "0.8", changefreq: "weekly" },
  { path: "/instant-live-cam-match", priority: "0.8", changefreq: "weekly" },
  { path: "/browser-based-video-chat", priority: "0.8", changefreq: "weekly" },
  { path: "/video-chat-dating", priority: "0.8", changefreq: "weekly" },
  { path: "/make-money-online", priority: "0.7", changefreq: "weekly" },
  { path: "/community", priority: "0.6", changefreq: "daily" },
  { path: "/leaderboard", priority: "0.6", changefreq: "daily" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/about-founder", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/support", priority: "0.5", changefreq: "monthly" },
  { path: "/media", priority: "0.4", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
  { path: "/refund-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/tools", priority: "0.8", changefreq: "weekly" },
  { path: "/embed-video-call", priority: "0.8", changefreq: "weekly" },
  { path: "/rankings", priority: "0.7", changefreq: "daily" },
];

export const Route = createFileRoute("/sitemap-core.xml")({
  server: {
    handlers: {
      GET: () => {
        const lastmod = freshLastmod();
        const entries = CORE_PATHS.map(
          (p) =>
            `  <url>\n    <loc>${ORIGIN}${p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
        );

        for (const pillar of HUB_PILLARS) {
          entries.push(
            `  <url>\n    <loc>${ORIGIN}/en/discover/hub/${pillar.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
          );
        }

        for (const tool of MICRO_TOOLS) {
          entries.push(
            `  <url>\n    <loc>${ORIGIN}/tools/${tool.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
          );
        }

        for (const location of [] as typeof PSEO_LOCATIONS) {
          entries.push(
            `  <url>\n    <loc>${ORIGIN}/rankings/${location.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>`,
          );
        }

        for (const locale of OMEGLE_LOCALES) {
          if (locale.code === "en") continue;
          entries.push(
            `  <url>\n    <loc>${ORIGIN}${omeglePath(locale.code)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
          );
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
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
