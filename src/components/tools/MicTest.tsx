import { useCallback, useEffect, useRef, useState } from "react";
import { Metrics, Note, Panel, RunButton, ScoreRing } from "./ToolKit";

export default function MicTest() {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [avg, setAvg] = useState(0);
  const [label, setLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const sumRef = useRef({ total: 0, count: 0 });

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    setActive(false);
    setLevel(0);
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    sumRef.current = { total: 0, count: 0 };
    setPeak(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      setLabel(stream.getAudioTracks()[0]?.label || "Microphone");
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const buffer = new Uint8Array(analyser.fftSize);

      const loop = () => {
        analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const v = (buffer[i]! - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buffer.length);
        const value = Math.min(100, Math.round(rms * 320));
        setLevel(value);
        setPeak((p) => Math.max(p, value));
        sumRef.current.total += value;
        sumRef.current.count += 1;
        setAvg(Math.round(sumRef.current.total / sumRef.current.count));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
      setActive(true);
    } catch {
      setError("We could not open your microphone. Check that you allowed access in your browser.");
    } finally {
      setBusy(false);
    }
  }, []);

  const score = peak === 0 ? null : peak > 96 ? 55 : Math.min(100, Math.round(peak * 1.15));

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Voice" />
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="h-4 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
              <div
                className="h-full rounded-full transition-[width] duration-75"
                style={{
                  width: `${level}%`,
                  background:
                    level > 92 ? "linear-gradient(90deg,#fbbf24,#f87171)" : "linear-gradient(90deg,#34d399,#22d3ee)",
                }}
              />
            </div>
            <p className="mt-2 text-xs text-white/45">
              {active
                ? level > 92
                  ? "A bit loud — move back slightly."
                  : level > 12
                    ? "You are coming through clearly."
                    : "Say something…"
                : "Start the test and speak normally."}
            </p>
          </div>
          <Metrics
            items={[
              { label: "Current", value: level },
              { label: "Peak", value: peak || "—" },
              { label: "Average", value: avg || "—" },
            ]}
          />
          <RunButton onClick={active ? stop : start} running={busy} tone={active ? "amber" : "emerald"}>
            {active ? "Stop test" : "Start microphone test"}
          </RunButton>
          {label && active ? <p className="truncate text-xs text-white/40">{label}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Note>Audio is analysed on your device in real time and is never recorded or uploaded.</Note>
        </div>
      </div>
    </Panel>
  );
}
