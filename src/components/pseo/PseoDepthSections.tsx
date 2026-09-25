import type { PseoDepth } from "@/lib/pseoDepth";

/**
 * Server-rendered depth layer for every {niche × city} page.
 * Pure markup: no state, no effects, no event listeners — it cannot
 * contribute to INP and it is fully present in the initial HTML.
 */
export default function PseoDepthSections({ depth }: { depth: PseoDepth }) {
  return (
    <>
      <section aria-labelledby="key-facts" className="mt-12">
        <h2 id="key-facts" className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
          Key facts at a glance
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {depth.keyFacts.map((f) => (
            <div key={f.term} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">{f.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/70">{f.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="start-steps" aria-labelledby="steps-heading" className="mt-12">
        <h2 id="steps-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.steps.heading}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">{depth.steps.intro}</p>
        <ol className="mt-4 space-y-3">
          {depth.steps.items.map((s, i) => (
            <li key={s.name} className="flex min-w-0 gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{s.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-white/60">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="compare-heading" className="mt-12">
        <h2 id="compare-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.compare.heading}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">{depth.compare.intro}</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-white/[0.06] text-[11px] uppercase tracking-[0.12em] text-white/45">
                <th scope="col" className="px-4 py-3 font-semibold">Feature</th>
                <th scope="col" className="px-4 py-3 font-semibold text-emerald-300">Caakus</th>
                <th scope="col" className="px-4 py-3 font-semibold">Older random chat sites</th>
              </tr>
            </thead>
            <tbody>
              {depth.compare.rows.map((r) => (
                <tr key={r.feature} className="border-t border-white/[0.07] align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-white/80">{r.feature}</th>
                  <td className="px-4 py-3 text-emerald-200/90">{r.caakus}</td>
                  <td className="px-4 py-3 text-white/55">{r.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="safety-heading" className="mt-12">
        <h2 id="safety-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.safety.heading}
        </h2>
        <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-white/65">
          {depth.safety.paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {depth.safety.bullets.map((b) => (
            <div key={b.term} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="text-sm font-semibold text-white">{b.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/55">{b.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="network-heading" className="mt-12">
        <h2 id="network-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.network.heading}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">{depth.network.intro}</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-white/[0.06] text-[11px] uppercase tracking-[0.12em] text-white/45">
                {depth.network.columns.map((c) => (
                  <th key={c} scope="col" className="px-4 py-3 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depth.network.rows.map((r) => (
                <tr key={r.cells[0]} className="border-t border-white/[0.07]">
                  {r.cells.map((cell, i) => (
                    <td key={cell} className={i === 0 ? "px-4 py-3 font-medium text-white/80" : "px-4 py-3 text-white/55"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/50">{depth.network.note}</p>
      </section>

      <section aria-labelledby="timing-heading" className="mt-12">
        <h2 id="timing-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.timing.heading}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">{depth.timing.intro}</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-white/[0.06] text-[11px] uppercase tracking-[0.12em] text-white/45">
                {depth.timing.columns.map((c) => (
                  <th key={c} scope="col" className="px-4 py-3 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depth.timing.rows.map((r) => (
                <tr key={r.cells[0]} className="border-t border-white/[0.07] align-top">
                  {r.cells.map((cell, i) => (
                    <td key={cell} className={i === 0 ? "px-4 py-3 font-medium text-white/80" : "px-4 py-3 text-white/55"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="starters-heading" className="mt-12">
        <h2 id="starters-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.starters.heading}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">{depth.starters.intro}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {depth.starters.items.map((s) => (
            <li key={s.slice(0, 32)} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/65">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="glossary-heading" className="mt-12">
        <h2 id="glossary-heading" className="text-lg font-bold leading-snug text-white sm:text-xl">
          {depth.glossary.heading}
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {depth.glossary.items.map((g) => (
            <div key={g.term} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="text-sm font-semibold text-white">{g.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/55">{g.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
