/**
 * useWebRTC — Caakus P2P call hook
 * ============================================================================
 * Native RTCPeerConnection over our own Hetzner TURN cluster, signalled by
 * Supabase Realtime. Trickle ICE, persistent local camera, optimistic UI
 * transitions, haptics and NSFW moderation, all wired in one place.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CaakusWebRTCService } from "../services/webrtcService";
import { startNsfwWatch, preloadModerationModel, type ModerationHandle } from "../services/nsfwModeration";
import { playCue } from "../utils/uiSound";

export type RtcPhase = "idle" | "searching" | "connecting" | "connected" | "failed";

interface UseWebRTCOptions {
  userId: string;
  enableModeration?: boolean;
  onPeerLeft?: () => void;
  onViolation?: (reason: string) => void;
}

/** Haptic + audio micro-feedback: 50ms tick, felt not heard. */
export function haptic(pattern: number | number[] = 50): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

export function useWebRTC(options: UseWebRTCOptions) {
  const service = useRef(CaakusWebRTCService.getInstance());
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const moderationRef = useRef<ModerationHandle | null>(null);

  const [phase, setPhase] = useState<RtcPhase>("idle");
  const [remoteVideoActive, setRemoteVideoActive] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<{ uplink: number; downlink: number } | null>(null);
  const [micReady, setMicReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (options.enableModeration !== false) preloadModerationModel();
  }, [options.enableModeration]);

  /** Warm up local media once — it is never released between calls. */
  const primeLocalMedia = useCallback(async () => {
    const mic = await service.current.ensureMicrophoneReady();
    setMicReady(mic.success);
    const cam = await service.current.ensureCameraReady();
    setCameraReady(cam.success);
    service.current.attachLocalVideo(localVideoRef.current);
    return { mic, cam };
  }, []);

  const startModeration = useCallback(
    (roomName: string | null) => {
      if (options.enableModeration === false) return;
      moderationRef.current?.stop();
      const el = localVideoRef.current?.querySelector<HTMLVideoElement>("video[data-caakus-rtc]");
      if (!el) return;
      moderationRef.current = startNsfwWatch(el, {
        userId: options.userId,
        roomName,
        subject: "local",
        onViolation: (reason) => {
          options.onViolation?.(reason);
          void service.current.leaveChannel();
          setPhase("idle");
        },
      });
    },
    [options],
  );

  /** Connect to a matched room. Optimistic UI flips before the handshake. */
  const connect = useCallback(
    async (roomName: string) => {
      setPhase("connecting");
      setRemoteVideoActive(false);
      await primeLocalMedia();

      const ok = await service.current.joinChannel(
        roomName,
        options.userId,
        () => {
          /* peer present */
        },
        () => {
          setRemoteVideoActive(false);
          setPhase("idle");
          options.onPeerLeft?.();
        },
        () => {
          setPhase("connected");
          haptic(50);
          playCue("match");
        },
        (hasVideo) => setRemoteVideoActive(hasVideo),
      );

      service.current.attachRemoteVideo(remoteVideoRef.current);
      startModeration(roomName);
      if (!ok) setPhase("failed");
      return ok;
    },
    [options, primeLocalMedia, startModeration],
  );

  /**
   * "Next" — instant. The local camera stays live; only the remote peer
   * connection is dropped, so the visual switch costs ~10ms.
   */
  const next = useCallback(async () => {
    playCue("tap");
    haptic(20);
    setRemoteVideoActive(false);
    setPhase("searching");
    await service.current.leaveChannel();
    service.current.attachLocalVideo(localVideoRef.current);
  }, []);

  const stop = useCallback(async () => {
    moderationRef.current?.stop();
    moderationRef.current = null;
    await service.current.leaveChannel();
    setPhase("idle");
    setRemoteVideoActive(false);
  }, []);

  useEffect(() => {
    const svc = service.current;
    svc.setNetworkQualityHandler((stats: any) => {
      setNetworkQuality({
        uplink: stats?.uplinkNetworkQuality ?? 0,
        downlink: stats?.downlinkNetworkQuality ?? 0,
      });
    });
    svc.setConnectionStateHandler((state) => {
      if (state === "CONNECTED") setPhase("connected");
      else if (state === "DISCONNECTED") setPhase("idle");
    });
    return () => {
      svc.setNetworkQualityHandler(null);
      svc.setConnectionStateHandler(null);
      moderationRef.current?.stop();
      moderationRef.current = null;
    };
  }, []);

  return {
    phase,
    micReady,
    cameraReady,
    remoteVideoActive,
    networkQuality,
    localVideoRef,
    remoteVideoRef,
    service: service.current,
    primeLocalMedia,
    connect,
    next,
    stop,
    setCameraEnabled: (enabled: boolean) => service.current.setCameraEnabled(enabled),
    toggleMute: (muted: boolean) => service.current.toggleMute(muted),
  };
}

export default useWebRTC;
