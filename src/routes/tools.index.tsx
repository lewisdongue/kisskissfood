import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MICRO_TOOLS } from "@/data/microTools";
import ToolLayout from "@/components/tools/ToolLayout";
import { buildDatasetJsonLd, buildSoftwareAppJsonLd, ORIGIN } from "@/lib/platformFacts";

const URL = `${ORIGIN}/tools`;
const TITLE = "Free Browser Lab — 10 Camera, Microphone & Connection Tools | Caakus";
const DESCRIPTION =
  "Ten free, instant browser tools: camera test, microphone test, video call speed test, connection checker and more. No download, no signup, nothing stored.";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "camera test, microphone test, video call speed test, webcam test online, connection checker, free browser tools",
      },
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
          "@graph": [
            buildDatasetJsonLd(URL, "Caakus browser lab"),
            buildSoftwareAppJsonLd({
              url: URL,
              name: "Caakus Browser Lab",
              description: DESCRIPTION,
              featureList: MICRO_TOOLS.map((t) => t.name),
            }),
            {
              "@type": "ItemList",
              "@id": `${URL}#list`,
              itemListElement: MICRO_TOOLS.map((tool, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: tool.name,
                url: `${ORIGIN}/tools/${tool.slug}`,
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  return (
    <ToolLayout
      eyebrow="Free browser lab"
      title="Ten free tools to check your camera, sound and connection"
      subtitle="Every tool runs inside your browser, gives you a clear score in seconds, and stores absolutely nothing. No account, no download."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {MICRO_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            to="/tools/$slug"
            params={{ slug: tool.slug }}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
          >
            <h2 className="text-base font-bold text-white">{tool.name}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">{tool.short}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              Open tool
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </ToolLayout>
  );
}
