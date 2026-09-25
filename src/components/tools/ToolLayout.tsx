import type { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import { prewarmHandlers } from "@/lib/p2pPrewarm";

export default function ToolLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]"
        aria-hidden
      />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link to="/" className="text-sm font-black tracking-tight text-white">
          Caakus
        </Link>
        <Link
          to="/tools"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition hover:text-white"
        >
          Free browser lab
        </Link>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 pb-20">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">{subtitle}</p>

        <div className="mt-8 space-y-10">{children}</div>

        <section className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/[0.08] to-sky-500/[0.05] p-6 sm:p-8">
          <h2 className="text-xl font-bold">Everything working? Meet someone right now.</h2>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            Caakus connects you with a real person in about a second. No signup, no download.
          </p>
          <Link
            to="/call"
            {...prewarmHandlers}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            Launch Live Video Match Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
