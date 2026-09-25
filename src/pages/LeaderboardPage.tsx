import { Suspense, lazy } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trophy, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";

const YUYULeaderboard = lazy(() =>
  import("@/components/YUYULeaderboard").then((m) => ({ default: m.YUYULeaderboard }))
);

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD PAGE — "The Arena"
// Immersive, cinematic ranking surface. Pure OLED, holographic HUD framing.
// ═══════════════════════════════════════════════════════════════════════════
export default function LeaderboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="district-stage min-h-screen w-full overflow-x-hidden">
      {/* ── Atmosphere ── */}
      <div className="district-horizon" aria-hidden />
      <div className="district-scanlines" aria-hidden />
      <div className="district-sweep" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]"
        aria-hidden
      />

      {/* ── HUD HEADER ── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="hud-label">Top Earners</span>
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_3px_rgba(124,92,255,0.7)]" />
          </div>

          <div className="w-[74px] sm:w-[92px]" />
        </div>
      </header>

      {/* ── CINEMATIC HERO ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-16">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
            <span className="hud-label">Live Rankings</span>
            <Zap className="h-3 w-3 text-violet-300/70" />
          </span>
        </div>

        <h1 className="chromatic-title text-[clamp(2.25rem,9vw,4.75rem)] font-black uppercase leading-[0.92]">
          {t("home.topEarnersTitle")}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/45">
          {t("home.topEarnersDesc")}
        </p>

        {/* Telemetry strip */}
        <div className="mt-9 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          {[
            { icon: <Users className="h-4 w-4" />, label: "Global Players" },
            { icon: <TrendingUp className="h-4 w-4" />, label: "Real Earnings" },
            { icon: <Trophy className="h-4 w-4" />, label: "YUYU Rewards" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 bg-black/60 px-2 py-4">
              <span className="text-violet-300/80">{item.icon}</span>
              <span className="hud-label line-clamp-1">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Primary action */}
        <div className="relative mt-10 inline-block">
          <div className="cta-aura absolute -inset-6 rounded-full" aria-hidden />
          <button
            onClick={() => navigate("/call")}
            className="cta-magnetic relative inline-flex items-center gap-3 rounded-2xl px-9 py-5 text-base font-black uppercase tracking-[0.12em]"
          >
            Start Earning Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* ── ARENA PANEL ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative">
          <div className="rank-beam pointer-events-none absolute -inset-x-10 bottom-0 top-1/3" aria-hidden />
          <div className="holo-panel holo-corners relative overflow-hidden rounded-3xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />

            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
              <span className="hud-label">Ranking Matrix</span>
              <span className="font-mono text-[10px] tracking-widest text-white/30">REALTIME</span>
            </div>

            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center gap-4 py-24">
                  <div className="h-10 w-10 animate-spin rounded-full border-[2px] border-white/10 border-t-violet-400" />
                  <p className="hud-label animate-pulse">Loading rankings</p>
                </div>
              }
            >
              <YUYULeaderboard />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
