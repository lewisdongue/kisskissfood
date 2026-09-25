import { createFileRoute } from "@tanstack/react-router";

// Automated programmatic pages were permanently removed (SEO cleanup).
// Return 410 Gone so search engines drop these URLs quickly.
const gone = () =>
  new Response("410 Gone — this page was permanently removed.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=86400" },
  });

export const Route = createFileRoute("/directory/$lang/$page")({
  server: { handlers: { GET: gone, HEAD: gone } },
});
