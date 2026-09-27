import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

export const OMEGLE_FAQ = [
  {
    q: "What is the best alternative to Omegle?",
    a: "Caakus is the best Omegle alternative in 2026: free, browser-based HD random video chat with bot protection, instant matching in under two seconds and rewards for real conversations.",
  },
  {
    q: "Why is Caakus safer than old random chat sites?",
    a: "Every account signs in before chatting, AI moderation scans streams in real time, and one tap reports or skips anyone. Old random chat sites allowed fully anonymous, unmoderated sessions.",
  },
  {
    q: "Are there bots on Caakus?",
    a: "Caakus runs a zero bots policy: sign-in is required, automated accounts are detected and removed, and reported bots are banned. You match with real people, not scripted loops.",
  },
];

export function OmegleConversionHero() {
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();
  const [phase, setPhase] = useState<"idle" | "matching" | "wall">("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (user && phase === "wall") navigate({ to: "/call" });
  }, [user, phase, navigate]);

  const start = () => {
    if (phase !== "idle") return;
    if (user) {
      navigate({ to: "/call" });
      return;
    }
    setPhase("matching");
    timer.current = window.setTimeout(() => setPhase("wall"), 1500);
  };

  return (
    <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[420px] max-w-3xl rounded-full bg-violet-600/25 blur-[140px]" aria-hidden />
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur-xl">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Omegle alternative · 2026
      </span>
      <h1 className="chromatic-title mt-6 text-[clamp(2rem,6.5vw,4rem)] font-black leading-[1] tracking-tight">
        The Ultimate Omegle Alternative for the Modern Web.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
        Experience instant, HD random video chat. No bots, no creeps—just 100% verified humans.
      </p>

      <div className="relative mt-10">
        <div className="cta-aura absolute -inset-6 rounded-full" aria-hidden />
        <button
          type="button"
          onClick={start}
          disabled={phase !== "idle"}
          className="cta-magnetic relative inline-flex min-h-16 items-center gap-3 rounded-2xl px-8 py-5 text-lg font-black uppercase tracking-[0.1em] motion-safe:animate-pulse disabled:animate-none sm:px-12 sm:text-xl"
        >
          {phase === "idle" ? (
            <>Start Video Chat Now <Zap className="h-6 w-6" /></>
          ) : (
            <><Loader2 className="h-6 w-6 animate-spin" /> Matching…</>
          )}
        </button>
      </div>

      <p className="mt-5 min-h-[2.5rem] text-sm text-white/50" aria-live="polite">
        {phase === "idle"
          ? "Free · No download · Works in your browser"
          : "Matching with a stranger... Establishing secure WebRTC connection..."}
      </p>

      {phase === "wall" && !user && (
        <AuthModal onLogin={login} onSignup={signup} canClose={false} />
      )}
    </section>
  );
}
