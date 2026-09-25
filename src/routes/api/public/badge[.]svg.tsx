// Live SVG status badge for Discord / GitHub profiles and forum signatures.
// Usage: <img src="https://www.caakus.com/api/public/badge.svg?label=Nathan" />

import { createFileRoute } from "@tanstack/react-router";
import { platformFacts } from "@/lib/platformFacts";

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

const THEMES: Record<string, { bg: string; fg: string; accent: string }> = {
  dark: { bg: "#0b1220", fg: "#e2e8f0", accent: "#34d399" },
  light: { bg: "#f8fafc", fg: "#0f172a", accent: "#059669" },
  neon: { bg: "#05070c", fg: "#ffffff", accent: "#22d3ee" },
};

export const Route = createFileRoute("/api/public/badge.svg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const label = (url.searchParams.get("label") || "Caakus").slice(0, 24);
        const theme = THEMES[url.searchParams.get("theme") || "dark"] ?? THEMES["dark"]!;
        const facts = platformFacts();
        const status = url.searchParams.get("status") || `${facts.matchesToday.toLocaleString("en-US")} chats today`;

        const labelWidth = 22 + label.length * 7.4;
        const statusWidth = 26 + status.length * 7;
        const width = Math.round(labelWidth + statusWidth);

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28" role="img" aria-label="${esc(label)}: ${esc(status)}">
  <rect width="${width}" height="28" rx="6" fill="${theme.bg}"/>
  <rect x="${labelWidth}" width="${width - labelWidth}" height="28" rx="6" fill="${theme.accent}" fill-opacity="0.14"/>
  <circle cx="14" cy="14" r="4" fill="${theme.accent}">
    <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite"/>
  </circle>
  <text x="24" y="18.5" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11.5" font-weight="700" fill="${theme.fg}">${esc(label)}</text>
  <text x="${labelWidth + 13}" y="18.5" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11.5" font-weight="700" fill="${theme.accent}">${esc(status)}</text>
</svg>`;

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
