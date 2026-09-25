import { Link } from "@tanstack/react-router";
import {
  ALT_MATRIX,
  EMBED_SNIPPET,
  GLOSSARY,
  PAA_FAQ,
  QUOTABLE_FACTS,
  SHARE_LINKS,
  START_STEPS,
  TROUBLESHOOTING,
} from "@/lib/omegleAuthority";

/**
 * Server-rendered authority layer for /omegle-alternative.
 * No state, no effects, no listeners: zero INP cost, full HTML on first byte.
 */

function Cta({ label = "Launch Live Match Now" }: { label?: string }) {
  return (
    <div className="my-10 flex flex-col items-center gap-3 text-center">
      <Link
        to="/call"
        className="cta-magnetic inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-black tracking-tight sm:text-lg"
      >
        {label}
      </Link>
      <p className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
        No signup before your first match · No download · 18+
      </p>
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-black tracking-tight text-white sm:text-3xl">
      {children}
    </h2>
  );
}

export default function OmegleAuthority() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      {/* Quick answer — the block answer engines lift verbatim. */}
      <section id="quick-answer" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          Short answer: what replaced Omegle?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/75">
          Omegle shut down on 8 November 2023 and never returned. Caakus is the closest
          working replacement: free random 1-to-1 video chat with strangers, no download,
          no account required to start, and a direct peer-to-peer connection instead of a
          relayed stream. A match usually starts in under two seconds, the service is
          adults-only, and every stream is encrypted in transit by WebRTC.
        </p>
        <Cta />
      </section>

      {/* Key facts — short declarative sentences, the format AI answers quote. */}
      <section className="mt-12">
        <SectionTitle id="key-facts">Key facts</SectionTitle>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUOTABLE_FACTS.map((fact) => (
            <li
              key={fact}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75"
            >
              {fact}
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mt-12">
        <SectionTitle id="start-in-4-steps">Start in 4 steps</SectionTitle>
        <ol className="mt-4 space-y-3">
          {START_STEPS.map((step, i) => (
            <li key={step.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-bold text-white">
                <span className="mr-2 text-emerald-300">{i + 1}.</span>
                {step.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{step.text}</p>
            </li>
          ))}
        </ol>
        <Cta label="Launch Live Match Now" />
      </section>

      {/* Comparison matrix — tables are heavily cited by AI answers. */}
      <section className="mt-12">
        <SectionTitle id="compare">Every Omegle alternative compared</SectionTitle>
        <p className="mt-2 text-sm text-white/55">
          Twelve platforms people search for after Omegle, on the four things that decide
          whether a random video chat actually works.
        </p>
        <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15 text-[11px] uppercase tracking-[0.14em] text-white/45">
                <th scope="col" className="py-3 pr-4 font-semibold">Platform</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Status</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Signup</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Connection</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Cost</th>
                <th scope="col" className="py-3 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {ALT_MATRIX.map((row) => (
                <tr key={row.name} className="border-b border-white/5 align-top">
                  <th scope="row" className="py-3 pr-4 font-bold text-white">{row.name}</th>
                  <td className="py-3 pr-4 text-white/65">{row.status}</td>
                  <td className="py-3 pr-4 text-white/65">{row.signup}</td>
                  <td className="py-3 pr-4 text-white/65">{row.transport}</td>
                  <td className="py-3 pr-4 text-white/65">{row.cost}</td>
                  <td className="py-3 text-white/65">{row.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Troubleshooting — captures "camera not working" style long tail. */}
      <section className="mt-12">
        <SectionTitle id="troubleshooting">Troubleshooting</SectionTitle>
        <div className="mt-4 space-y-3">
          {TROUBLESHOOTING.map((item) => (
            <article key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-bold text-white">{item.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Glossary — definition blocks feed DefinedTermSet + AI citations. */}
      <section className="mt-12">
        <SectionTitle id="glossary">Glossary</SectionTitle>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {GLOSSARY.map((t) => (
            <div key={t.term} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-sm font-bold text-white">{t.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/65">{t.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* People also ask */}
      <section className="mt-12">
        <SectionTitle id="questions">People also ask</SectionTitle>
        <div className="mt-4 space-y-3">
          {PAA_FAQ.map((item) => (
            <article key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-bold text-white">{item.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{item.a}</p>
            </article>
          ))}
        </div>
        <Cta label="Launch Live Match Now" />
      </section>

      {/* Share + embed: every share is a discovery path, every embed a backlink. */}
      <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <SectionTitle id="share">Send this to someone still looking for Omegle</SectionTitle>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SHARE_LINKS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-emerald-400/50 hover:text-white"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-sm font-bold text-white">Embed this on your site</h3>
        <p className="mt-1 text-sm text-white/60">
          Copy this line into any page, blog post or forum signature:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-emerald-200">
          <code>{EMBED_SNIPPET}</code>
        </pre>
      </section>
    </div>
  );
}
