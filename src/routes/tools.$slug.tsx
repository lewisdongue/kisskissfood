import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { MICRO_TOOLS, TOOL_BY_SLUG } from "@/data/microTools";
import ToolLayout from "@/components/tools/ToolLayout";
import { Panel } from "@/components/tools/ToolKit";
import { buildDatasetJsonLd, buildSoftwareAppJsonLd, ORIGIN } from "@/lib/platformFacts";

const WIDGETS: Record<string, ReturnType<typeof lazy>> = {
  "video-call-speed-test": lazy(() => import("@/components/tools/SpeedTest")),
  "camera-test": lazy(() => import("@/components/tools/CameraTest")),
  "connection-checker": lazy(() => import("@/components/tools/ConnectionChecker")),
  "mic-test": lazy(() => import("@/components/tools/MicTest")),
  "server-reachability-test": lazy(() => import("@/components/tools/ServerReachability")),
  "packet-loss-simulator": lazy(() => import("@/components/tools/PacketLossSimulator")),
  "screen-share-benchmark": lazy(() => import("@/components/tools/ScreenShareBenchmark")),
  "network-restriction-checker": lazy(() => import("@/components/tools/NetworkRestrictionChecker")),
  "resolution-fps-matcher": lazy(() => import("@/components/tools/ResolutionMatcher")),
  "encryption-verifier": lazy(() => import("@/components/tools/EncryptionVerifier")),
};

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = TOOL_BY_SLUG[params.slug];
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Tool not found — Caakus" }, { name: "robots", content: "noindex" }] };
    }
    const { tool } = loaderData;
    const url = `${ORIGIN}/tools/${params.slug}`;
    return {
      meta: [
        { title: tool.title },
        { name: "description", content: tool.description },
        { name: "keywords", content: tool.keywords },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: tool.title },
        { property: "og:description", content: tool.description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Caakus" },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://www.caakus.com/og/caakus-live.jpg" },
        { name: "twitter:image", content: "https://www.caakus.com/og/caakus-live.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: tool.title },
        { name: "twitter:description", content: tool.description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              buildSoftwareAppJsonLd({
                url,
                name: tool.name,
                description: tool.description,
                featureList: tool.features,
              }),
              buildDatasetJsonLd(url, tool.name),
              {
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                mainEntity: tool.faq.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${url}#crumbs`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Caakus", item: ORIGIN },
                  { "@type": "ListItem", position: 2, name: "Browser lab", item: `${ORIGIN}/tools` },
                  { "@type": "ListItem", position: 3, name: tool.name, item: url },
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
        <h1 className="text-2xl font-bold">This tool does not exist</h1>
        <Link to="/tools" className="mt-3 inline-block text-emerald-400 underline">
          See all free tools
        </Link>
      </div>
    </main>
  ),
  component: ToolPage,
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const Widget = WIDGETS[tool.slug];
  const others = MICRO_TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 6);

  return (
    <ToolLayout eyebrow="Free browser tool" title={tool.name} subtitle={tool.intro}>
      {Widget ? (
        <Suspense
          fallback={
            <Panel>
              <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
            </Panel>
          }
        >
          <Widget />
        </Suspense>
      ) : null}

      <section>
        <h2 className="text-xl font-bold">What this tool measures</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {tool.features.map((f) => (
            <li key={f} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">Questions people ask</h2>
        <div className="mt-4 space-y-3">
          {tool.faq.map((item) => (
            <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-bold text-white">{item.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">More free tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((t) => (
            <Link
              key={t.slug}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-emerald-400/30 hover:text-white"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </section>
    </ToolLayout>
  );
}
