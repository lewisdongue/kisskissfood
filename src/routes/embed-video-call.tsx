// Webmaster landing page: "embed video call HTML".

import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";
import { ArrowRight, Check } from "lucide-react";
import { buildDatasetJsonLd, buildSoftwareAppJsonLd, ORIGIN } from "@/lib/platformFacts";
import EmbedRoomModal from "@/components/growth/EmbedRoomModal";

const URL = `${ORIGIN}/embed-video-call`;
const TITLE = "Embed a Video Call on Your Website — Free HTML iframe Widget | Caakus";
const DESCRIPTION =
  "Add a free live video chat room to any website with one line of HTML. Copy the iframe snippet, paste it, done — no API key, no server, no maintenance.";

const SNIPPET = `<iframe src="https://www.caakus.com/embed/gamers-tokyo"
        width="320" height="220"
        style="border:0;border-radius:16px;max-width:100%"
        loading="lazy"
        allow="camera; microphone; autoplay"
        title="Live on Caakus"></iframe>`;

const FAQ = [
  {
    q: "Do I need an account or an API key to embed a video call?",
    a: "No. Copy the HTML snippet, paste it into your page and it works immediately. There is nothing to register and nothing to configure.",
  },
  {
    q: "Is the embedded widget free?",
    a: "Yes, it is completely free, including for commercial sites. The only requirement is that the small Powered by Caakus link stays visible.",
  },
  {
    q: "Will it slow down my page?",
    a: "No. The widget loads lazily, weighs a few kilobytes and never blocks your own content.",
  },
  {
    q: "Can I choose the topic or the city of the room?",
    a: "Yes. Change the last part of the address to any topic and city pair, for example gamers-tokyo or students-paris.",
  },
  {
    q: "Does it work on WordPress, Webflow, Ghost, Notion or Squarespace?",
    a: "Yes. Any platform that accepts an HTML or embed block will display it.",
  },
];

export const Route = createFileRoute("/embed-video-call")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "embed video call html, video chat iframe, embed video chat website, free video call widget, add live chat room to website",
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
            buildSoftwareAppJsonLd({
              url: URL,
              name: "Caakus Embeddable Video Room",
              description: DESCRIPTION,
              category: "WebApplication",
              featureList: [
                "One-line HTML iframe embed",
                "No API key and no server required",
                "Topic and city specific rooms",
                "Lazy loaded, a few kilobytes",
              ],
            }),
            buildDatasetJsonLd(URL, "Caakus embeddable rooms"),
            {
              "@type": "FAQPage",
              "@id": `${URL}#faq`,
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "HowTo",
              "@id": `${URL}#howto`,
              name: "How to embed a live video call on your website",
              totalTime: "PT1M",
              step: [
                { "@type": "HowToStep", name: "Copy the snippet", text: "Copy the HTML iframe code from this page." },
                { "@type": "HowToStep", name: "Paste it", text: "Paste it into any HTML or embed block on your site." },
                { "@type": "HowToStep", name: "Publish", text: "Save and publish. The room is live immediately." },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: EmbedLanding,
});

function EmbedLanding() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">For website owners</p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Embed a live video call on your website with one line of HTML
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">
          Give your visitors a real, working video chat room. Copy the snippet, paste it into your page, and it is live.
          No account, no API key, no server, no maintenance, and it is free.
        </p>

        <pre className="mt-7 overflow-auto rounded-3xl border border-white/10 bg-black/60 p-5 text-[12px] leading-relaxed text-emerald-300">
          <code>{SNIPPET}</code>
        </pre>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <EmbedRoomModal room="gamers-tokyo" label="Gamers in Tokyo" />
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            Free browser tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            "Works on WordPress, Webflow, Ghost, Notion, Squarespace and plain HTML",
            "Lazy loaded — it never slows your page down",
            "Pick any topic and city pair for the room",
            "Free forever, including on commercial sites",
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm text-white/70">{item}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Live preview</h2>
          <div className="mt-4 max-w-xs overflow-hidden rounded-2xl border border-white/10">
            <iframe src="/embed/gamers-tokyo" title="Live room preview" className="h-[220px] w-full" loading="lazy" />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Questions people ask</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-sm font-bold text-white">{item.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
