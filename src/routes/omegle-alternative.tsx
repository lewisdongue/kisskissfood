import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";
import { omegleAlternateLinks } from "@/lib/omegleSeo";
import { OMEGLE_LOCALES, omeglePath } from "@/data/omegleLocales";
import { buildAuthorityJsonLd } from "@/lib/omegleAuthority";
import { OmegleConversionHero, OMEGLE_FAQ } from "@/components/omegle/OmegleConversionHero";

const OmegleSeoBody = lazy(() => import("@/components/omegle/OmegleSeoBody"));
const OmegleAlternative = lazy(() => import("../pages/OmegleAlternative"));
const OmegleAuthority = lazy(() => import("@/components/omegle/OmegleAuthority"));

const TITLE = "The #1 Omegle Alternative in 2026 | Safe, Bot-Free Random Video Chat";
const DESC =
  "Omegle is gone. Join Caakus, the ultimate bot-free Omegle alternative for 2026. Talk to strangers instantly in HD video. 100% verified humans.";
const URL = "https://www.caakus.com/omegle-alternative";

const seo = { ...FOOTER_SEO["omegle-alternative"]!, title: TITLE, description: DESC };
const baseHead = buildHead(seo);

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Caakus",
      url: URL,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web browser",
      featureList: ["WebRTC Video", "Bot-Free"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: OMEGLE_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export const Route = createFileRoute("/omegle-alternative")({
  head: () => ({
    ...baseHead(),
    links: omegleAlternateLinks("en"),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(JSON_LD) },
      { type: "application/ld+json", children: JSON.stringify(buildAuthorityJsonLd()) },
    ],
  }),
  component: OmegleRoute,
});

function OmegleRoute() {
  return (
    <main className="district-stage relative min-h-screen w-full overflow-x-hidden">
      <div className="district-horizon" aria-hidden />
      <OmegleConversionHero />
      <Suspense fallback={null}>
        <OmegleSeoBody />
        <OmegleAlternative />
        <OmegleAuthority />
      </Suspense>
      <nav aria-labelledby="omegle-langs" className="relative z-10 mx-auto w-full max-w-5xl border-t border-white/10 px-4 py-10 sm:px-6">
        <h2 id="omegle-langs" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
          Read this page in your language
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {OMEGLE_LOCALES.filter((l) => l.code !== "en").map((l) => (
            <li key={l.code}>
              <a href={omeglePath(l.code)} hrefLang={l.hreflang} className="text-sm text-white/55 hover:text-emerald-300">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
