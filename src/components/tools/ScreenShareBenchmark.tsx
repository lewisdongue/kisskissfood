import { useCallback, useEffect, useRef, useState } from "react";
import { Metrics, Note, Panel, RunButton, ScoreRing } from "./ToolKit";

export default function ScreenShareBenchmark() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ w: number; h: number; fps: number; dropped: number; total: number } | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const md = navigator.mediaDevices as MediaDevices & {
        getDisplayMedia?: (c: MediaStreamConstraints) => Promise<MediaStream>;
      };
      if (!md.getDisplayMedia) throw new Error("unsupported");
      const stream = await md.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      const track = stream.getVideoTracks()[0]!;
      track.onended = stop;
      setActive(true);

      timerRef.current = window.setInterval(() => {
        const s = track.getSettings();
        const q = (video as HTMLVideoElement & { getVideoPlaybackQuality?: () => VideoPlaybackQuality })
          ?.getVideoPlaybackQuality?.();
        setStats({
          w: s.width ?? 0,
          h: s.height ?? 0,
          fps: Math.round(s.frameRate ?? 0),
          dropped: q?.droppedVideoFrames ?? 0,
          total: q?.totalVideoFrames ?? 0,
        });
      }, 1_000);
    } catch {
      setError("Screen sharing is not available here. Most phones block it — try a laptop or desktop.");
    } finally {
      setBusy(false);
    }
  }, [stop]);

  const score = stats
    ? Math.max(
        5,
        Math.min(
          100,
          Math.round((Math.min(stats.fps, 30) / 30) * 70 + (stats.h >= 1080 ? 30 : stats.h >= 720 ? 22 : 12)) -
            (stats.total ? Math.round((stats.dropped / Math.max(1, stats.total)) * 100) : 0),
        ),
      )
    : null;

  return (
    <Panel>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} playsInline muted className="h-full w-full object-contain" />
          {!active ? (
            <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/40">
              Your shared window appears here
            </div>
          ) : null}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <ScoreRing score={score} label="Smoothness" />
            <p className="min-w-0 text-sm text-white/60">
              Share a window or a tab and we measure the frame rate your browser really delivers.
            </p>
          </div>
          <Metrics
            items={[
              { label: "Captured size", value: stats ? `${stats.w}×${stats.h}` : "—" },
              { label: "Frame rate", value: stats ? `${stats.fps} fps` : "—" },
              { label: "Dropped frames", value: stats ? stats.dropped : "—" },
            ]}
          />
          <RunButton onClick={active ? stop : start} running={busy} tone={active ? "amber" : "sky"}>
            {active ? "Stop benchmark" : "Start screen benchmark"}
          </RunButton>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Note>Nothing you share is transmitted, recorded or stored. The preview is local to this page.</Note>
        </div>
      </div>
    </Panel>
  );
}
