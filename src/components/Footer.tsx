import { Link as RouteLink } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";

type FooterItem = { to: string; label: string };

const COLUMNS: { title: string; links: FooterItem[] }[] = [
  {
    title: "Top alternatives",
    links: [
      { to: "/omegle-alternative", label: "Omegle alternative" },
      { to: "/monkey-app-alternative", label: "Monkey app alternative" },
      { to: "/chatroulette-alternative", label: "Chatroulette alternative" },
      { to: "/ometv-alternative", label: "OmeTV alternative" },
      { to: "/azar-alternative", label: "Azar alternative" },
      { to: "/coomeet-alternative", label: "CooMeet alternative" },
    ],
  },
  {
    title: "Top searches",
    links: [
      { to: "/random-video-chat", label: "Free random video chat" },
      { to: "/talk-to-strangers", label: "Talk to strangers online" },
      { to: "/anonymous-webcam-chat", label: "Anonymous webcam chat" },
      { to: "/face-to-face-random-chat", label: "Face-to-face random chat" },
      { to: "/no-signup-video-match", label: "No signup video match" },
    ],
  },
  {
    title: "User intent",
    links: [
      { to: "/meet-new-people", label: "Meet new people instantly" },
      { to: "/safe-chat-with-strangers", label: "Safe chat with strangers" },
      { to: "/instant-live-cam-match", label: "Instant live cam match" },
      { to: "/browser-based-video-chat", label: "Browser-based video chat" },
      { to: "/tools/video-call-speed-test", label: "Zero-latency WebRTC" },
    ],
  },
];

const LEGAL_LINKS = [
  { to: "/about-founder", label: "About Founder" },
  { to: "/community", label: "Community" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms-of-service", label: "Terms of Service" },
  { to: "/contact", label: "Contact" },
  { to: "/refund-policy", label: "Refund Policy" },
];

const linkClass = "block min-h-0 min-w-0 py-1 text-sm !text-zinc-400 transition-colors duration-75 hover:!text-white";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto bg-background pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Explore Caakus" className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title} className="min-w-0">
              <h2 className="mb-4 text-[11px] font-bold uppercase text-zinc-200">{column.title}</h2>
              <ul className="space-y-1.5">
                {column.links.map((item) => (
                  <li key={item.to} className="min-w-0">
                    <Link to={item.to} className={linkClass}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="min-w-0">
            <h2 className="mb-4 text-[11px] font-bold uppercase text-zinc-200">Global hubs</h2>
            <ul className="space-y-1.5">
              <li><RouteLink to="/$lang/omegle-alternative" params={{ lang: "fr" }} hrefLang="fr" className={linkClass}>Français — chat aléatoire</RouteLink></li>
              <li><RouteLink to="/$lang/omegle-alternative" params={{ lang: "de" }} hrefLang="de" className={linkClass}>Deutsch — Omegle Alternative</RouteLink></li>
              <li><RouteLink to="/$lang/omegle-alternative" params={{ lang: "es" }} hrefLang="es" className={linkClass}>Español — videollamada gratis</RouteLink></li>
              <li><RouteLink to="/$lang/omegle-alternative" params={{ lang: "ja" }} hrefLang="ja" className={linkClass}>日本語 — ランダムチャット</RouteLink></li>
            </ul>
          </div>
        </nav>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-zinc-600">
          <span>© 2026 Caakus</span>
          {LEGAL_LINKS.map((item) => (
            <span key={item.to} className="inline-flex items-center gap-2">
              <span aria-hidden>|</span>
              <Link to={item.to} className="min-h-0 min-w-0 py-1 !text-zinc-600 transition-colors duration-75 hover:!text-zinc-300">{item.label}</Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
