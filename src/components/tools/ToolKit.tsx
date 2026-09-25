// Shared SaaS-grade primitives for the Caakus browser lab tools.

import type { ReactNode } from "react";

export function ScoreRing({ score, label }: { score: number | null; label?: string }) {
  const value = score == null ? 0 : Math.max(0, Math.min(100, Math.round(score)));
  const tone = value >= 80 ? "#34d399" : value >= 55 ? "#fbbf24" : "#f87171";
  const dash = (value / 100) * 264;
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={tone}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} 264`}
          style={{ transition: "stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-black text-white">{score == null ? "—" : value}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label ?? "Score"}</div>
      </div>
    </div>
  );
}

export function Metrics({ items }: { items: { label: string; value: ReactNode; hint?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-white/40">{item.label}</dt>
          <dd className="mt-1 truncate text-base font-bold text-white">{item.value}</dd>
          {item.hint ? <p className="mt-0.5 truncate text-[11px] text-white/35">{item.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

export function RunButton({
  onClick,
  running,
  children,
  disabled,
  tone = "emerald",
}: {
  onClick: () => void;
  running?: boolean;
  children: ReactNode;
  disabled?: boolean;
  tone?: "emerald" | "sky" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-400 hover:bg-emerald-300",
    sky: "bg-sky-400 hover:bg-sky-300",
    amber: "bg-amber-400 hover:bg-amber-300",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || running}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-950 transition disabled:opacity-60 ${tones[tone]}`}
    >
      {running ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
      ) : null}
      {children}
    </button>
  );
}

export function Steps({ steps }: { steps: { label: string; value?: string; state: "pending" | "ok" | "fail" }[] }) {
  return (
    <ul className="space-y-1.5">
      {steps.map((s) => (
        <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2 text-white/70">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                s.state === "ok" ? "bg-emerald-400" : s.state === "fail" ? "bg-rose-400" : "animate-pulse bg-white/30"
              }`}
            />
            <span className="truncate">{s.label}</span>
          </span>
          <span className="shrink-0 font-mono text-xs text-white/50">{s.value ?? "…"}</span>
        </li>
      ))}
    </ul>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-white/45">{children}</p>;
}
