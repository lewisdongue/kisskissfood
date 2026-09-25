// Embeddable Caakus room widget. Loaded by third-party sites inside an
// <iframe>. Deliberately tiny, bare and noindex — the viral loop is the
// discreet "Powered by Caakus" attribution link.

import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Radio, Users } from "lucide-react";
import { CATEGORY_BY_SLUG, LOCATION_BY_SLUG } from "@/data/pseoData";
import { freshMetrics, localClock } from "@/lib/pseoFresh";
import { ORIGIN } from "@/lib/platformFacts";
import { prewarmHandlers } from "@/lib/p2pPrewarm";

export const Route = createFileRoute("/embed/$room")({
  loader: ({ params }) => {
    // room is "<category>-<location>" or any free-form label.
    const [categorySlug, ...rest] = params.room.split("-");
    const locationSlug = rest.join("-");
    const category = CATEGORY_BY_SLUG.get(categorySlug ?? "") ?? null;
    const location = LOCATION_BY_SLUG.get(locationSlug) ?? null;
    const metrics = location ? freshMetrics(category?.slug ?? "people", location) : null;
    const clock = location ? localClock(location) : null;
    return {
      room: params.room,
      title: location ? `${category?.labels.en ?? "People"} in ${location.name}` : "Caakus live room",
      place: location?.name ?? "Worldwide",
      online: metrics?.onlineNow ?? 24,
      time: clock?.time ?? null,
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    "X-Frame-Options": "",
    "Content-Security-Policy": "frame-ancestors *",
  }),
  head: () => ({
    meta: [{ title: "Caakus live room" }, { name: "robots", content: "noindex, follow" }],
  }),
  component: EmbedWidget,
});

function EmbedWidget() {
  const { room, title, place, online, time } = Route.useLoaderData();
  const callUrl = `${ORIGIN}/call?room=${encodeURIComponent(room)}&utm_source=embed&utm_medium=widget`;

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-slate-950 p-4 text-white">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live now
        </div>
        <h1 className="mt-2 text-lg font-black leading-tight">{title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {online} ready to talk
          </span>
          <span className="inline-flex items-center gap-1">
            <Radio className="h-3.5 w-3.5" /> {place}
            {time ? ` · ${time} local` : ""}
          </span>
        </p>
      </div>

      <a
        href={callUrl}
        target="_blank"
        rel="noopener"
        {...prewarmHandlers}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
      >
        Start video chat
        <ArrowUpRight className="h-4 w-4" />
      </a>

      <a
        href={`${ORIGIN}/?utm_source=embed&utm_medium=attribution`}
        target="_blank"
        rel="noopener"
        className="mt-3 block text-center text-[11px] text-white/35 transition hover:text-white/70"
      >
        Powered by Caakus
      </a>
    </div>
  );
}
