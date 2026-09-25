import { useCallback, useEffect, useRef, useState } from "react";
import { Note, Panel, RunButton, ScoreRing } from "./ToolKit";

const TARGETS = [
  { label: "360p", w: 640, h: 360 },
  { label: "480p", w: 854, h: 480 },
  { label: "720p", w: 1280, h: 720 },
  { label: "1080p", w: 1920, h: 1080 },
  { label: "1440p", w: 2560, h: 1440 },
  { label: "4K", w: 3840, h: 2160 },
];

type Row = { label: string; got: string; fps: number; ok: boolean };

export default function ResolutionMatcher() {
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setRows([]);
    setError(null);
    try {
      for (const target of TARGETS) {
        let stream: MediaStream | null = null;
        try {
          // eslint-disable-next-line no-await-in-loop
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { exact: target.w }, height: { exact: target.h }, frameRate: { ideal: 30 } },
            audio: false,
          });
          const s = stream.getVideoTracks()[0]!.getSettings();
          if (!mounted.current) return;
          setRows((prev) => [
            ...prev,
            { label: target.label, got: `${s.width}×${s.height}`, fps: Math.round(s.frameRate ?? 0), ok: true },
          ]);
        } catch {
          if (!mounted.current) return;
          setRows((prev) => [...prev, { label: target.label, got: "not supported", fps: 0, ok: false }]);
        } finally {
          stream?.getTracks().forEach((t) => t.stop());
        }
      }
    } catch {
      setError("We could not open your camera. Check that you allowed access in your browser.");
    } finally {
      setRunning(false);
    }
  }, []);

  const best = rows.filter((r) => r.ok).at(-1) ?? null;
  const supported = rows.filter((r) => r.ok).length;
  const score = rows.length ? Math.round((supported / TARGETS.length) * 100) : null;
  const recommended = rows.find((r) => r.label === "720p" && r.ok) ? "720p at 30 fps" : best?.label ?? null;

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Capability" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm text-white/60">
            {best
              ? `Your camera reached ${best.label}. Best everyday setting: ${recommended}.`
              : "We will ask your camera for each common picture setting and report what it really delivers."}
          </p>
          <RunButton onClick={run} running={running}>
            {running ? "Testing settings…" : rows.length ? "Test again" : "Find my best setting"}
          </RunButton>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.label}
              className={`rounded-2xl border p-3 ${
                r.ok ? "border-emerald-400/25 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="text-sm font-bold text-white">{r.label}</div>
              <div className="mt-0.5 truncate text-xs text-white/50">{r.got}</div>
              {r.ok ? <div className="text-xs text-emerald-400">{r.fps} fps</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <Note>Each setting is opened for a fraction of a second and immediately released. Nothing is recorded.</Note>
      </div>
    </Panel>
  );
}
