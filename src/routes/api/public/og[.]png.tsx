// Dynamic Open Graph card for invites and dark-social sharing.
// Rendered on the edge with workers-og (Satori + resvg WASM).

import { createFileRoute } from "@tanstack/react-router";
import { platformFacts } from "@/lib/platformFacts";

const ONE_DAY = 86_400;

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

function markup(city: string, headline: string, sub: string, online: number): string {
  return `
  <div style="display:flex;flex-direction:column;justify-content:space-between;width:1200px;height:630px;background:#05070c;padding:72px;font-family:sans-serif;">
    <div style="display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;">
        <div style="display:flex;width:18px;height:18px;border-radius:9999px;background:#34d399;margin-right:14px;box-shadow:0 0 0 10px rgba(52,211,153,0.18);"></div>
        <div style="display:flex;color:#34d399;font-size:26px;letter-spacing:6px;font-weight:700;">LIVE IN ${esc(city.toUpperCase())}</div>
      </div>
      <div style="display:flex;color:#ffffff;font-size:76px;font-weight:800;line-height:1.05;margin-top:34px;max-width:1000px;">${esc(headline)}</div>
      <div style="display:flex;color:#94a3b8;font-size:34px;margin-top:26px;max-width:940px;">${esc(sub)}</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;color:#ffffff;font-size:34px;font-weight:800;">caakus.com</div>
      <div style="display:flex;align-items:center;background:rgba(52,211,153,0.12);border:2px solid rgba(52,211,153,0.35);border-radius:9999px;padding:16px 30px;">
        <div style="display:flex;color:#34d399;font-size:28px;font-weight:700;">${online} people online now</div>
      </div>
    </div>
  </div>`;
}

export const Route = createFileRoute("/api/public/og.png")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const city = (url.searchParams.get("city") || "your city").slice(0, 40);
        const facts = platformFacts();
        const online = Math.max(12, Math.round(facts.matchesToday / 900));
        const headline = (url.searchParams.get("title") || "Someone is waiting to chat").slice(0, 80);
        const sub = (
          url.searchParams.get("sub") ||
          `Tap in and you are face to face in about ${facts.averageConnectionSeconds} seconds. No signup.`
        ).slice(0, 140);

        try {
          const { ImageResponse } = await import("workers-og");
          return new ImageResponse(markup(city, headline, sub, online), {
            width: 1200,
            height: 630,
            headers: {
              "Cache-Control": `public, max-age=0, s-maxage=${ONE_DAY}, stale-while-revalidate=604800`,
            },
          }) as unknown as Response;
        } catch {
          // Never break a share: fall back to a static SVG card.
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#05070c"/><circle cx="82" cy="104" r="10" fill="#34d399"/><text x="110" y="114" fill="#34d399" font-family="sans-serif" font-size="26" letter-spacing="6" font-weight="700">LIVE IN ${esc(city.toUpperCase())}</text><text x="72" y="270" fill="#ffffff" font-family="sans-serif" font-size="72" font-weight="800">${esc(headline)}</text><text x="72" y="340" fill="#94a3b8" font-family="sans-serif" font-size="32">${esc(sub)}</text><text x="72" y="560" fill="#ffffff" font-family="sans-serif" font-size="34" font-weight="800">caakus.com</text></svg>`;
          return new Response(svg, {
            headers: {
              "Content-Type": "image/svg+xml; charset=utf-8",
              "Cache-Control": `public, max-age=0, s-maxage=${ONE_DAY}`,
            },
          });
        }
      },
    },
  },
});
