import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { LOCATION_BY_SLUG, PSEO_CATEGORIES } from "@/data/pseoData";
import { freshMetrics, localClock } from "@/lib/pseoFresh";
import { buildDatasetJsonLd, ORIGIN } from "@/lib/platformFacts";
import { prewarmHandlers } from "@/lib/p2pPrewarm";
import EmbedRoomModal from "@/components/growth/EmbedRoomModal";

export const Route = createFileRoute("/rankings/$location")({
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  }),
  loader: ({ params }) => {
    const location = LOCATION_BY_SLUG.get(params.location);
    if (!location) throw notFound();
    const clock = localClock(location);
    const rows = PSEO_CATEGORIES.map((category) => {
      const m = freshMetrics(category.slug, location);
      return {
        slug: category.slug,
        label: category.labels.en ?? category.slug,
        online: m.onlineNow,
        wait: m.avgMatchSeconds,
      };
    }).sort((a, b) => b.online - a.online);
    return { location, clock, rows };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "City not found — Caakus" }, { name: "robots", content: "noindex" }] };
    const { location } = loaderData;
    const url = `${ORIGIN}/rankings/${params.location}`;
    const title = `${location.name} Live Activity — Who Is Video Chatting Right Now | Caakus`;
    const description = `Live community activity in ${location.name}, ${location.country}: people online by interest, average wait before a match, and the busiest local hours.`;
    return {
      meta: [
        { name: "robots", content: "noindex, follow" },
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Caakus" },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://www.caakus.com/og/caakus-live.jpg" },
        { name: "twitter:image", content: "https://www.caakus.com/og/caakus-live.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              buildDatasetJsonLd(url, `Caakus live activity in ${location.name}`),
              {
                "@type": "BreadcrumbList",
                "@id": `${url}#crumbs`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Caakus", item: ORIGIN },
                  { "@type": "ListItem", position: 2, name: "Live rankings", item: `${ORIGIN}/rankings` },
                  { "@type": "ListItem", position: 3, name: location.name, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white">
      <div>
        <h1 className="text-2xl font-bold">We do not track this city yet</h1>
        <Link to="/rankings" className="mt-3 inline-block text-emerald-400 underline">
          See all live rankings
        </Link>
      </div>
    </main>
  ),
  component: CityRanking,
});

function CityRanking() {
  const { location, clock, rows } = Route.useLoaderData();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <main className="mx-auto max-w-3xl px-5 py-14">
        <Link to="/rankings" className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40 hover:text-white">
          Live rankings
        </Link>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {location.name} is live — {clock.time} local
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">
          Here is what the {location.name} community looks like today, sorted by how many people are ready to talk in
          each interest. Numbers refresh once a day.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/call"
            {...prewarmHandlers}
            className="inline-flex rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            Launch Live Video Match Now
          </Link>
          <EmbedRoomModal room={`${rows[0]?.slug ?? "people"}-${location.slug}`} label={`${location.name} live room`} />
        </div>

        <ol className="mt-10 space-y-2">
          {rows.map((row, i) => (
            <li
              key={row.slug}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="w-7 shrink-0 text-sm font-black text-white/35">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold capitalize text-white hover:text-emerald-300">{row.label}</span>
                <p className="text-xs text-white/45">Usually about {row.wait}s before someone appears</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-emerald-400">{row.online}</span>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
