// Interactive micro-tool injected into every programmatic page.
// Simulates a peer-to-peer latency probe against the local city edge so the
// page carries real interactive JavaScript value (rendered by Googlebot's
// headless engine), not just static text.

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Gauge, Wifi } from "lucide-react";

type Props = {
  city: string;
  country: string;
  nicheLabel: string;
  baselinePingMs: number;
};

type Probe = { label: string; ms: number };

const HOPS = ["STUN handshake", "ICE candidate pair", "DTLS setup", "Media round-trip"];

export default function LatencyEstimator({ city, country, nicheLabel, baselinePingMs }: Props) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [probes, setProbes] = useState<Probe[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setProbes([]);
    setState("running");

    HOPS.forEach((label, i) => {
      const jitter = Math.round((Math.random() - 0.4) * 18);
      const ms = Math.max(8, Math.round(baselinePingMs * (0.35 + i * 0.22)) + jitter);
      timers.current.push(
        setTimeout(
          () => {
            setProbes((prev) => [...prev, { label, ms }]);
            if (i === HOPS.length - 1) setState("done");
          },
          260 * (i + 1),
        ),
      );
    });
  }, [baselinePingMs]);

  const total = probes.reduce((sum, p) => Math.max(sum, p.ms), 0);

  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <Gauge className="h-4 w-4 text-emerald-400" />
            Connection quality estimator — {city}
          </h3>
          <p className="mt-1 text-sm text-white/55">
            Estimate peer-to-peer latency between your device and {nicheLabel} currently routed
            through the {city}, {country} relay mesh.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={state === "running"}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
      >
        <Wifi className="h-4 w-4" />
        {state === "running" ? "Probing…" : state === "done" ? "Run test again" : `Test latency to ${city}`}
      </button>

      <ul className="mt-4 space-y-2" aria-live="polite">
        {probes.map((probe) => (
          <li
            key={probe.label}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2 text-white/70">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              {probe.label}
            </span>
            <span className="font-mono font-bold text-emerald-300">{probe.ms} ms</span>
          </li>
        ))}
      </ul>

      {state === "done" ? (
        <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Estimated round-trip to {city}: <strong>{total} ms</strong> —{" "}
          {total < 90 ? "excellent for HD video" : total < 160 ? "good, stable video" : "fine for voice, video may adapt"}.
          Values are a client-side simulation based on regional WebRTC baselines, not a live server
          measurement.
        </p>
      ) : null}
    </div>
  );
}
