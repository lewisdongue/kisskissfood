import { useCallback, useEffect, useRef, useState } from "react";
import { Metrics, Note, Panel, RunButton, ScoreRing } from "./ToolKit";

export default function CameraTest() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ w: number; h: number; fps: number; label: string } | null>(null);
  const [cameras, setCameras] = useState<string[]>([]);

  const stop = useCallback(() => {
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      const track = stream.getVideoTracks()[0]!;
      const settings = track.getSettings();
      setInfo({
        w: settings.width ?? 0,
        h: settings.height ?? 0,
        fps: Math.round(settings.frameRate ?? 0),
        label: track.label || "Camera",
      });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput").map((d, i) => d.label || `Camera ${i + 1}`));
      setActive(true);
    } catch {
      setError("We could not open your camera. Check that you allowed access and that no other app is using it.");
    } finally {
      setBusy(false);
    }
  }, []);

  const score = info ? Math.min(100, Math.round((info.h / 1080) * 60 + (info.fps / 30) * 40)) : null;

  return (
    <Panel>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          {!active ? (
            <div className="absolute inset-0 grid place-items-center text-sm text-white/40">Preview appears here</div>
          ) : null}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <ScoreRing score={score} label="Quality" />
            <div className="min-w-0 text-sm text-white/60">
              {info ? (
                <>
                  <p className="truncate font-semibold text-white">{info.label}</p>
                  <p className="mt-1">
                    {cameras.length} camera{cameras.length === 1 ? "" : "s"} detected
                  </p>
                </>
              ) : (
                <p>Start the test to see your picture and its real settings.</p>
              )}
            </div>
          </div>
          <Metrics
            items={[
              { label: "Resolution", value: info ? `${info.w}×${info.h}` : "—" },
              { label: "Frame rate", value: info ? `${info.fps} fps` : "—" },
              { label: "Status", value: active ? "Live" : "Off" },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <RunButton onClick={active ? stop : start} running={busy} tone={active ? "amber" : "emerald"}>
              {active ? "Stop camera" : "Start camera test"}
            </RunButton>
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Note>The picture is shown on your device only. Nothing is recorded or uploaded.</Note>
        </div>
      </div>
    </Panel>
  );
}
