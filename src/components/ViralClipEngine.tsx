import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { Clapperboard, Check, X, Download, Share2, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useYuyuBalance } from "@/context/YuyuBalanceContext";

const W = 720;
const H = 1280;
const CLIP_MS = 60_000;

type Props = {
  active: boolean;
  roomName: string | null;
  userId: string;
  username: string;
  localContainer: React.RefObject<HTMLElement | null>;
  remoteContainer: React.RefObject<HTMLElement | null>;
};

type Phase = "idle" | "requesting" | "incoming" | "recording" | "saved";

type RewardFlight = { startX: number; startY: number; endX: number; endY: number };

function pickMime(): string {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

function grabVideo(container: HTMLElement | null): HTMLVideoElement | null {
  return container?.querySelector<HTMLVideoElement>("video[data-caakus-rtc]") ?? null;
}

function grabStream(container: HTMLElement | null): MediaStream | null {
  const v = grabVideo(container);
  const src = v?.srcObject;
  return src instanceof MediaStream ? src : null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!video || !video.videoWidth || !video.videoHeight) {
    ctx.fillStyle = "#08080c";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
  const dw = video.videoWidth * scale;
  const dh = video.videoHeight * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(video, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

export default function ViralClipEngine({
  active,
  roomName,
  userId,
  username,
  localContainer,
  remoteContainer,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const fileRef = useRef<File | null>(null);
  const rewardIdRef = useRef<string | null>(null);
  const rewardClaimingRef = useRef(false);
  const rewardClaimedRef = useRef(false);
  const [rewardFlight, setRewardFlight] = useState<RewardFlight | null>(null);
  const { applyOptimisticDelta, refresh: refreshYuyuBalance } = useYuyuBalance();
  const reduceMotion = useReducedMotion();

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    recorderRef.current = null;
    canvasRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    rewardIdRef.current = null;
    rewardClaimingRef.current = false;
    rewardClaimedRef.current = false;
    setRewardFlight(null);
    if (roomName) {
      void supabase.rpc("begin_viral_clip_reward", { p_room_name: roomName }).then(({ data }) => {
        rewardIdRef.current = typeof data === "string" ? data : null;
      });
    }
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const half = H / 2;
    const started = Date.now();

    const loop = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      drawCover(ctx, grabVideo(remoteContainer.current), 0, 0, W, half);
      drawCover(ctx, grabVideo(localContainer.current), 0, half, W, half);

      const grad = ctx.createLinearGradient(0, H - 130, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - 130, W, 130);

      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 30px Inter, system-ui, sans-serif";
      ctx.fillText("CAAKUS.COM", W / 2, H - 58);
      ctx.fillStyle = "rgba(167,139,250,0.95)";
      ctx.font = "600 22px Inter, system-ui, sans-serif";
      ctx.fillText(`@${username}`, W / 2, H - 28);

      setProgress(Math.min(1, (Date.now() - started) / CLIP_MS));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const stream = canvas.captureStream(30);

    // Merge local mic + remote peer audio via Web Audio API
    try {
      const AudioCtor: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtor();
      audioCtxRef.current = audioCtx;
      void audioCtx.resume().catch(() => {});
      const dest = audioCtx.createMediaStreamDestination();
      let attached = 0;
      for (const container of [localContainer.current, remoteContainer.current]) {
        const ms = grabStream(container);
        if (!ms || ms.getAudioTracks().length === 0) continue;
        const only = new MediaStream(ms.getAudioTracks());
        const src = audioCtx.createMediaStreamSource(only);
        const gain = audioCtx.createGain();
        gain.gain.value = 1;
        src.connect(gain).connect(dest);
        attached += 1;
      }
      if (attached > 0) {
        for (const track of dest.stream.getAudioTracks()) stream.addTrack(track);
      }
    } catch {
      /* audio merge unavailable — record video only */
    }

    const mimeType = pickMime();
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType, videoBitsPerSecond: 3_000_000, audioBitsPerSecond: 128_000 } : undefined,
    );
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || "video/webm";
      const ext = type.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunksRef.current, { type });
      const file = new File([blob], `caakus-clip-${Date.now()}.${ext}`, { type });
      fileRef.current = file;
      setClipUrl(URL.createObjectURL(blob));
      setCanShare(
        typeof navigator !== "undefined" &&
          typeof navigator.share === "function" &&
          (navigator.canShare?.({ files: [file] }) ?? false),
      );
      cleanup();
      setPhase("saved");
    };

    recorder.start(1000);
    setPhase("recording");
    stopTimerRef.current = window.setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    }, CLIP_MS);
  }, [cleanup, localContainer, remoteContainer, roomName, username]);

  // Peer consent signalling
  useEffect(() => {
    if (!active || !roomName) return;
    const channel = supabase.channel(`clip:${roomName}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    channelRef.current = channel;
    channel.on("broadcast", { event: "clip" }, ({ payload }) => {
      if (!payload || payload.from === userId) return;
      if (payload.kind === "request") setPhase((p) => (p === "idle" ? "incoming" : p));
      if (payload.kind === "accept") setPhase((p) => (p === "requesting" ? "recording" : p));
      if (payload.kind === "decline") setPhase((p) => (p === "requesting" ? "idle" : p));
    });
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [active, roomName, userId]);

  useEffect(() => {
    if (phase === "recording" && !recorderRef.current) startRecording();
  }, [phase, startRecording]);

  useEffect(() => {
    if (!active) {
      if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
      cleanup();
      setPhase("idle");
    }
  }, [active, cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  const closePreview = useCallback(() => {
    if (clipUrl) window.setTimeout(() => URL.revokeObjectURL(clipUrl), 2000);
    setClipUrl(null);
    fileRef.current = null;
    setPhase("idle");
  }, [clipUrl]);

  const claimReward = useCallback(async (sourceRect: DOMRect) => {
    const rewardId = rewardIdRef.current;
    if (!rewardId || rewardClaimingRef.current || rewardClaimedRef.current) return;
    rewardClaimingRef.current = true;
    const { data, error } = await supabase.rpc("claim_viral_clip_reward", { p_reward_id: rewardId });
    const result = data as { credited?: boolean; amount?: number } | null;
    rewardClaimingRef.current = false;
    if (error) return;
    rewardClaimedRef.current = true;
    rewardIdRef.current = null;
    if (!result?.credited) return;

    const destination = Array.from(document.querySelectorAll<HTMLElement>("[data-yuyu-balance]"))
      .find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    const destinationRect = destination?.getBoundingClientRect();
    setRewardFlight({
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      endX: destinationRect ? destinationRect.left + destinationRect.width / 2 : window.innerWidth - 36,
      endY: destinationRect ? destinationRect.top + destinationRect.height / 2 : 28,
    });
    applyOptimisticDelta(result.amount ?? 50);
    window.dispatchEvent(new CustomEvent("caakus-yuyu-reward", { detail: { amount: result.amount ?? 50 } }));
    window.setTimeout(() => {
      setRewardFlight(null);
      refreshYuyuBalance();
    }, 1250);
  }, [applyOptimisticDelta, refreshYuyuBalance]);

  const directDownload = useCallback(() => {
    const file = fileRef.current;
    if (!file || !clipUrl) return;
    const a = document.createElement("a");
    a.href = clipUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [clipUrl]);

  const downloadClip = useCallback(async (sourceRect: DOMRect) => {
    const file = fileRef.current;
    if (!file) return;

    const mobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (
      mobileDevice &&
      typeof navigator.share === "function" &&
      (navigator.canShare?.({ files: [file] }) ?? false)
    ) {
      try {
        await navigator.share({ files: [file], title: "Caakus clip" });
        void claimReward(sourceRect);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    directDownload();
    if (mobileDevice && clipUrl) window.open(clipUrl, "_blank", "noopener,noreferrer");
    void claimReward(sourceRect);
  }, [claimReward, clipUrl, directDownload]);

  const shareClip = useCallback(async (sourceRect: DOMRect) => {
    const file = fileRef.current;
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "Caakus clip", text: "Recorded on CAAKUS.COM" });
      void claimReward(sourceRect);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      directDownload();
      void claimReward(sourceRect);
    }
  }, [claimReward, directDownload]);

  const send = (kind: "request" | "accept" | "decline") =>
    channelRef.current?.send({ type: "broadcast", event: "clip", payload: { kind, from: userId } });

  if (!active) return null;

  const secondsLeft = Math.max(0, Math.ceil((1 - progress) * 60));

  return (
    <>
      <div className="pointer-events-none relative z-30 flex min-w-0 max-w-full justify-end">
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              key="trigger"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  setPhase("requesting");
                  void send("request");
                }}
                aria-label="Create viral clip"
                className="pointer-events-auto h-10 max-w-[8.75rem] rounded-full border border-violet-400/50 bg-violet-600 px-3 text-xs font-bold text-white shadow-lg hover:bg-violet-500 sm:h-11 sm:max-w-none sm:px-4 sm:text-sm"
              >
                <Clapperboard className="h-4 w-4 shrink-0" />
                <span className="truncate sm:hidden">Create clip</span>
                <span className="hidden sm:inline">Create viral clip</span>
              </Button>
            </motion.div>
          )}

          {phase === "requesting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto max-w-[8.75rem] truncate rounded-full border border-white/10 bg-black/80 px-3 py-2 text-[11px] text-white/75 backdrop-blur-xl sm:max-w-none"
            >
              Waiting for partner…
            </motion.div>
          )}

          {phase === "incoming" && (
            <motion.div
              key="incoming"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto fixed right-2 top-[calc(env(safe-area-inset-top)+0.5rem)] z-[90] w-[min(17rem,calc(100vw-1rem))] rounded-2xl border border-violet-500/30 bg-black/90 p-3 shadow-2xl backdrop-blur-xl sm:right-4 sm:top-4"
            >
              <p className="text-xs font-semibold text-white">Record a 60s clip together?</p>
              <p className="mt-1 text-[11px] text-white/60">Saved straight to your device.</p>
              <div className="mt-2.5 flex gap-2">
                <Button
                  onClick={() => {
                    void send("accept");
                    setPhase("recording");
                  }}
                  className="h-11 flex-1 rounded-xl bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-500"
                >
                  <Check className="h-3.5 w-3.5" /> Accept
                </Button>
                <Button
                  onClick={() => {
                    void send("decline");
                    setPhase("idle");
                  }}
                  variant="ghost"
                  className="h-11 w-11 rounded-xl border border-white/15 p-0 text-white/70"
                  aria-label="Decline clip"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "recording" && (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-auto flex h-9 max-w-[8.75rem] items-center gap-1.5 rounded-full border border-red-500/40 bg-black/85 py-1 pl-2.5 pr-1 backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-semibold tabular-nums text-white">{secondsLeft}s</span>
              <Button
                onClick={() => recorderRef.current?.stop()}
                variant="ghost"
                className="h-7 rounded-full bg-white/10 px-2 text-[10px] font-semibold text-white/80"
              >
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {typeof document !== "undefined" && createPortal(
        <>
          <AnimatePresence>
            {rewardFlight && (
              <motion.div
                key="yuyu-reward-flight"
                className="pointer-events-none fixed left-0 top-0 z-[10020] flex items-center gap-1.5 whitespace-nowrap text-sm font-black text-amber-300 drop-shadow-lg will-change-transform"
                initial={{ x: rewardFlight.startX, y: rewardFlight.startY, opacity: 0, scale: 0.72 }}
                animate={reduceMotion
                  ? { x: rewardFlight.startX, y: rewardFlight.startY - 24, opacity: [0, 1, 0], scale: 1 }
                  : { x: rewardFlight.endX, y: rewardFlight.endY, opacity: [0, 1, 1, 0], scale: [0.72, 1.08, 1, 0.62], rotate: [0, -8, 8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.12, 0.78, 1] }}
              >
                <Rocket className="h-6 w-6 fill-amber-300/30" aria-hidden />
                <span>+50 Yuyus</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {phase === "saved" && (
          <motion.div
            className="fixed inset-0 z-[10002] flex items-center justify-center overflow-hidden bg-black/80 p-2 backdrop-blur-sm sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="grid max-h-[calc(100dvh-1rem)] w-full max-w-sm grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-violet-500/30 bg-background p-3 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-4"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <h3 className="text-base font-bold text-white">Your clip is ready</h3>
                <Button
                  onClick={closePreview}
                  aria-label="Close"
                  variant="ghost"
                  size="icon"
                  className="z-[9999] h-12 w-12 shrink-0 rounded-full text-white/60 hover:text-white touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="min-h-0 overflow-hidden py-2">
                {clipUrl && (
                  <video
                    src={clipUrl}
                    controls
                    playsInline
                    autoPlay
                    loop
                    className="mx-auto h-full max-h-[52dvh] w-auto max-w-full rounded-xl bg-black object-contain"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <Button
                  onClick={(event) => void downloadClip(event.currentTarget.getBoundingClientRect())}
                  className="h-12 w-full rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-500"
                >
                  <Download className="h-5 w-5" /> Download video
                </Button>
                {canShare && (
                  <Button
                    onClick={(event) => void shareClip(event.currentTarget.getBoundingClientRect())}
                    variant="outline"
                    className="h-12 w-full rounded-xl border-violet-500/40 bg-transparent font-semibold text-violet-200 hover:bg-violet-500/10 hover:text-violet-100"
                  >
                    <Share2 className="h-5 w-5" /> Save to gallery / Share
                  </Button>
                )}
                <p className="px-2 text-center text-[11px] leading-4 text-white/60">
                  Ready for TikTok or Reels.
                </p>
              </div>
            </motion.div>
          </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body,
      )}
    </>
  );
}
