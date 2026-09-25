import { createFileRoute } from "@tanstack/react-router";
import OmegleAlternative from "../pages/OmegleAlternative";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";
import { omegleAlternateLinks } from "@/lib/omegleSeo";
import { OMEGLE_LOCALES, omeglePath } from "@/data/omegleLocales";
import OmegleAuthority from "@/components/omegle/OmegleAuthority";
import { buildAuthorityJsonLd } from "@/lib/omegleAuthority";

const seo = FOOTER_SEO["omegle-alternative"]!;
const baseHead = buildHead(seo);

export const Route = createFileRoute("/omegle-alternative")({
  // English is the canonical variant; every localized twin is declared here.
  head: () => {
    const head = baseHead();
    return { ...head, links: omegleAlternateLinks("en") };
  },
  component: () => (
    <DistrictPage seo={seo}>
      <OmegleAlternative />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAuthorityJsonLd()) }}
      />
      <OmegleAuthority />
      <nav
        aria-labelledby="omegle-langs"
        className="mx-auto w-full max-w-5xl border-t border-white/10 px-4 py-10 sm:px-6"
      >
        <h2
          id="omegle-langs"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40"
        >
          Read this page in your language
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {OMEGLE_LOCALES.filter((l) => l.code !== "en").map((l) => (
            <li key={l.code}>
              <a
                href={omeglePath(l.code)}
                hrefLang={l.hreflang}
                className="text-sm text-white/55 transition-colors hover:text-emerald-300"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </DistrictPage>
  ),
});
