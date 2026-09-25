import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PSEO_LOCATIONS } from "@/data/pseoData";
import { freshMetrics, localClock } from "@/lib/pseoFresh";
import { buildDatasetJsonLd, ORIGIN, platformFacts } from "@/lib/platformFacts";
import { prewarmHandlers } from "@/lib/p2pPrewarm";

const URL = `${ORIGIN}/rankings`;
const TITLE = "Live City Rankings — Where People Are Video Chatting Right Now | Caakus";
const DESCRIPTION =
  "See which cities are the most active on Caakus right now: people online, average wait, busiest hours. Updated every day across 100+ cities.";

export const Route = createFileRoute("/rankings/")({
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  }),
  loader: () => {
    const rows = PSEO_LOCATIONS.map((location) => {
      const m = freshMetrics("people", location);
      return {
        slug: location.slug,
        name: location.name,
        country: location.country,
        online: m.onlineNow,
        time: localClock(location).time,
      };
    })
      .sort((a, b) => b.online - a.online)
      .slice(0, 60);
    return { rows, facts: platformFacts() };
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Caakus" },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://www.caakus.com/og/caakus-live.jpg" },
      { name: "twitter:image", content: "https://www.caakus.com/og/caakus-live.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [buildDatasetJsonLd(URL, "Caakus live city activity")],
        }),
      },
    ],
  }),
  component: RankingsPage,
});

function RankingsPage() {
  const { rows, facts } = Route.useLoaderData();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">Live rankings</p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          The cities talking the most on Caakus right now
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">
          {facts.matchesToday.toLocaleString("en-US")} conversations started today, with an average of{" "}
          {facts.averageConnectionSeconds} seconds before the other person appears. The board refreshes every day.
        </p>

        <Link
          to="/call"
          {...prewarmHandlers}
          className="mt-6 inline-flex rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          Launch Live Video Match Now
        </Link>

        <ol className="mt-10 space-y-2">
          {rows.map((row, i) => (
            <li
              key={row.slug}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="w-7 shrink-0 text-sm font-black text-white/35">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <Link
                  to="/rankings/$location"
                  params={{ location: row.slug }}
                  className="block truncate text-sm font-bold text-white hover:text-emerald-300"
                >
                  {row.name}
                </Link>
                <p className="truncate text-xs text-white/45">
                  {row.country} · {row.time} local
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-emerald-400">{row.online}</span>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
