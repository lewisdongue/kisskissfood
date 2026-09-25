import { Link as RouteLink } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";
import { PseoLink } from "@/components/pseo/DirectoryBridge";
import type { BridgeCluster } from "@/lib/hubBridge";

// ═══════════════════════════════════════════════════════════════════════════
// 5-COLUMN MASTER LINK MATRIX
// Pure server-rendered internal-link map: maximises crawl depth and spreads
// PageRank from every page to the money pages + programmatic matrix.
// No existing slug is altered — this only adds inbound internal links.
// ═══════════════════════════════════════════════════════════════════════════

type Item = { to: string; label: string };

const ALTERNATIVES: Item[] = [
  { to: "/omegle-alternative", label: "Omegle alternative" },
  { to: "/omegle-alternative#start", label: "Best Omegle alternative" },
  { to: "/random-video-chat", label: "Free Omegle alternative" },
  { to: "/chatroulette-alternative", label: "OmeTV alternative" },
  { to: "/monkey-app-alternative", label: "Monkey alternative" },
  { to: "/chatroulette-alternative", label: "Chatroulette alternative" },
  { to: "/call", label: "No download video chat" },
];

const FEATURES: Item[] = [
  { to: "/random-video-chat", label: "Free video chat" },
  { to: "/talk-to-strangers", label: "Anonymous chat" },
  { to: "/talk-to-strangers", label: "Talk to strangers" },
  { to: "/call", label: "No signup random chat" },
  { to: "/meet-new-people", label: "Live webcam match" },
  { to: "/azar-alternative", label: "100% secure chat" },
];

const COMPARE: Item[] = [
  { to: "/omegle-alternative", label: "Caakus vs Omegle" },
  { to: "/chatroulette-alternative", label: "Caakus vs OmeTV" },
  { to: "/monkey-app-alternative", label: "Caakus vs Monkey" },
  { to: "/about", label: "Why switch to Caakus" },
  { to: "/tools/video-call-speed-test", label: "Zero-latency WebRTC" },
];

const ECOSYSTEM: { to?: string; href?: string; label: string }[] = [
  { href: "https://t.me/caakus_bot", label: "Telegram Mini App" },
  { to: "/community", label: "Community Blog" },
  { to: "/terms-of-use", label: "Safety Guidelines" },
  { to: "/plan", label: "VIP Perks" },
  { to: "/en/discover/hub/instant-global-matchmaking", label: "Global Hubs" },
];

const LANGS: { lang: string; label: string }[] = [
  { lang: "fr", label: "Français — alternative Omegle" },
  { lang: "de", label: "Deutsch — Omegle Alternative" },
  { lang: "es", label: "Español — chat de vídeo gratis" },
  { lang: "ja", label: "日本語 — ランダムチャット" },
  { lang: "ko", label: "한국어 — 낯선 사람과 대화" },
];

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className="min-w-0">
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/50">{title}</h5>
      <ul className="mt-3 space-y-2">{children}</ul>
    </nav>
  );
}

const linkCls = "block truncate text-xs text-white/45 transition-colors hover:text-white";

export default function FooterMatrix({ trending }: { trending: BridgeCluster[] }) {
  const cloud = trending.flatMap((c) => c.links).slice(0, 36);

  return (
    <section aria-labelledby="footer-matrix" className="border-t border-white/10 py-8">
      <h4
        id="footer-matrix"
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70"
      >
        <div className="h-4 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
        Explore Caakus
      </h4>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        <Col title="Alternatives">
          {ALTERNATIVES.map((l) => (
            <li key={l.label} className="min-w-0">
              <Link to={l.to} className={linkCls}>
                {l.label}
              </Link>
            </li>
          ))}
        </Col>

        <Col title="Features">
          {FEATURES.map((l) => (
            <li key={l.label} className="min-w-0">
              <Link to={l.to} className={linkCls}>
                {l.label}
              </Link>
            </li>
          ))}
        </Col>

        <Col title="Compare">
          {COMPARE.map((l) => (
            <li key={l.label} className="min-w-0">
              <Link to={l.to} className={linkCls}>
                {l.label}
              </Link>
            </li>
          ))}
        </Col>

        <Col title="Ecosystem">
          {ECOSYSTEM.map((l) => (
            <li key={l.label} className="min-w-0">
              {l.href ? (
                <a href={l.href} target="_blank" rel="noopener" className={linkCls}>
                  {l.label}
                </a>
              ) : (
                <Link to={l.to!} className={linkCls}>
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </Col>

        <Col title="Global & languages">
          {LANGS.map((l) => (
            <li key={l.lang} className="min-w-0">
              <RouteLink
                to="/$lang/omegle-alternative"
                params={{ lang: l.lang }}
                hrefLang={l.lang}
                className={linkCls}
              >
                {l.label}
              </RouteLink>
            </li>
          ))}
        </Col>
      </div>

      {cloud.length > 0 ? (
        <div className="mt-8">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            Trending searches
          </h5>
          <div className="mt-3 flex flex-wrap gap-2">
            {cloud.map((l) => (
              <PseoLink
                key={`${l.category}-${l.location}`}
                lang={l.lang}
                category={l.category}
                location={l.location}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/45 transition-colors hover:border-purple-400/40 hover:text-white"
              >
                {l.label}
              </PseoLink>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
