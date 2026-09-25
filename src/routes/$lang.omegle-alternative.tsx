import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import {
  OMEGLE_DEFAULT_LOCALE,
  OMEGLE_LOCALES,
  OMEGLE_LOCALE_BY_CODE,
  omeglePath,
} from "@/data/omegleLocales";
import { LANGUAGE_BY_CODE } from "@/data/pseoData";
import { ORIGIN } from "@/lib/pseo";
import { omegleDirectoryClusters } from "@/lib/omegleBridge";
import { LocalizedOmeglePage } from "@/components/omegle/LocalizedOmeglePage";
import { buildOmegleJsonLd, buildOmegleHead } from "@/lib/omegleSeo";

// Localized money page: /{lang}/omegle-alternative
// English stays canonical at /omegle-alternative, so /en/... redirects there.
export const Route = createFileRoute("/$lang/omegle-alternative")({
  loader: ({ params }) => {
    if (params.lang === OMEGLE_DEFAULT_LOCALE) {
      throw redirect({ to: "/omegle-alternative" });
    }
    const locale = OMEGLE_LOCALE_BY_CODE.get(params.lang);
    if (!locale) throw notFound();

    // The programmatic matrix only exists for pseo languages; fall back to the
    // English matrix so no directory link can ever resolve to a 404.
    const directoryLang = LANGUAGE_BY_CODE.has(locale.code) ? locale.code : "en";
    return {
      locale,
      clusters: omegleDirectoryClusters(directoryLang),
      hourStamp: Math.floor(Date.now() / 3_600_000),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — Caakus" }, { name: "robots", content: "noindex" }] };
    }
    return buildOmegleHead(loaderData.locale);
  },
  component: LocalizedRoute,
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center text-white">
      <h1 className="text-2xl font-bold">This language variant is not available yet</h1>
      <p className="mt-3 text-white/60">
        Read the Omegle alternative page in one of our supported languages.
      </p>
      <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {OMEGLE_LOCALES.map((l) => (
          <li key={l.code}>
            <a href={omeglePath(l.code)} hrefLang={l.hreflang} className="text-emerald-300 underline">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </main>
  ),
});

function LocalizedRoute() {
  const { locale, clusters, hourStamp } = Route.useLoaderData();
  const jsonLd = buildOmegleJsonLd(locale, `${ORIGIN}${omeglePath(locale.code)}`);
  return (
    <>
      <script
        type="application/ld+json"
        // Server-rendered structured data: FAQPage + WebApplication + Breadcrumbs.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocalizedOmeglePage locale={locale} clusters={clusters} hourStamp={hourStamp} />
    </>
  );
}
