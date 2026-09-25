import { Link } from "@/lib/router-compat";
import { ArrowRight, Check, X } from "lucide-react";
import {
  FOOTER_SEO_DEPTH,
  buildDefinedTermJsonLd,
  buildHowToJsonLd,
  buildItemListJsonLd,
} from "@/data/footerSeoDepth";

// ═══════════════════════════════════════════════════════════════════════════
// DEPTH SECTIONS — per-slug unique authority modules for footer SEO pages.
// Quick answer (AEO citable), key facts, comparison matrix, how-to steps,
// use cases, glossary, myth-busting and cross-links + matching JSON-LD.
// Presentational only.
// ═══════════════════════════════════════════════════════════════════════════

const panel =
  "holo-panel holo-corners relative overflow-hidden rounded-3xl p-6 sm:p-8";
const h2 = "text-xl font-black tracking-tight text-white sm:text-2xl";

export default function DepthSections({ path }: { path: string }) {
  const slug = path.replace(/^\//, "");
  const d = FOOTER_SEO_DEPTH[slug];
  if (!d) return null;

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-4 pb-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildHowToJsonLd(d.howToTitle, d.howTo)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildDefinedTermJsonLd(`${slug} glossary`, d.glossary)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildItemListJsonLd("Related pages", d.related)),
        }}
      />

      <div className="grid gap-5">
        {/* Quick answer — designed to be quoted by AI answer engines */}
        <article className={panel}>
          <span className="hud-label">Short answer</span>
          <p className="mt-3 text-[16px] font-semibold leading-relaxed text-white/85">
            {d.quickAnswer}
          </p>
          <ul className="mt-5 grid gap-2.5">
            {d.keyFacts.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-white/65">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Comparison matrix */}
        <article className={panel}>
          <h2 className={h2}>{d.comparisonTitle}</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                  <th className="py-2 pr-4 font-semibold">Platform</th>
                  <th className="py-2 pr-4 font-semibold">Signup</th>
                  <th className="py-2 pr-4 font-semibold">Cost</th>
                  <th className="py-2 pr-4 font-semibold">Mobile</th>
                  <th className="py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {d.comparison.map((r) => (
                  <tr key={r.name} className="border-t border-white/[0.07] align-top">
                    <td className="py-3 pr-4 font-bold text-white/90">{r.name}</td>
                    <td className="py-3 pr-4 text-white/60">{r.signup}</td>
                    <td className="py-3 pr-4 text-white/60">{r.cost}</td>
                    <td className="py-3 pr-4 text-white/60">{r.mobile}</td>
                    <td className="py-3 text-white/60">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* How-to */}
        <article className={panel}>
          <h2 className={h2}>{d.howToTitle}</h2>
          <ol className="mt-5 grid gap-4">
            {d.howTo.map((s, i) => (
              <li key={s.name} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 font-mono text-xs font-black text-violet-200">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-white/90">{s.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        {/* Use cases */}
        <article className={panel}>
          <h2 className={h2}>{d.useCasesTitle}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {d.useCases.map((u, i) => (
              <div key={`${u.title}-${i}`} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <h3 className="text-[14px] font-bold text-white/90">{u.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{u.body}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Myths */}
        <article className={panel}>
          <h2 className={h2}>Myths, corrected</h2>
          <div className="mt-5 grid gap-4">
            {d.myths.map((m) => (
              <div key={m.claim} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="flex items-start gap-2.5 text-sm font-semibold text-white/80">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  {m.claim}
                </p>
                <p className="mt-2 flex items-start gap-2.5 text-sm leading-relaxed text-white/55">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {m.reality}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Glossary */}
        <article className={panel}>
          <h2 className={h2}>Glossary</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {d.glossary.map((t) => (
              <div key={t.term} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <dt className="text-[14px] font-bold text-white/90">{t.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/55">{t.def}</dd>
              </div>
            ))}
          </dl>
        </article>

        {/* Cross-links */}
        <article className={panel}>
          <h2 className={h2}>Keep exploring</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {d.related.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="group flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-violet-400/40 hover:bg-violet-500/[0.06]"
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-300 transition-transform group-hover:translate-x-0.5" />
                <span>
                  <span className="block text-[14px] font-bold text-white/90">{r.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/55">{r.blurb}</span>
                </span>
              </Link>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
