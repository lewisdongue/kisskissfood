/**
 * CAAKUS P2P WEBRTC SERVICE
 * ============================================================================
 * Replaces the previous third-party RTC vendor with a native
 * `RTCPeerConnection` pipeline over our own Hetzner STUN/TURN cluster and
 * Supabase Realtime as the signaling bus.
 *
 * Design principles:
 *  - The local camera stream is created ONCE and NEVER stopped between calls.
 *    "Next" only tears down the peer connection (~10ms) and re-negotiates.
 *  - Trickle ICE: candidates are broadcast the instant they are gathered, so
 *    media flows as soon as the first pair is nominated (typically < 200ms).
 *  - Perfect negotiation (polite / impolite peer) eliminates SDP glare when
 *    thousands of users hammer "Next" simultaneously.
 *  - The public API is intentionally identical to the legacy RTC service so
 *    the calling UI keeps working untouched.
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import {
  AUDIO_CONSTRAINTS,
  PEER_CONNECTION_CONFIG,
  VIDEO_BITRATE_LADDER,
  VIDEO_CONSTRAINTS,
  type NetworkQualityLevel,
} from "../config/webrtc";

type ServiceResult = { success: boolean; error?: string };

interface ConnectionCallbacks {
  onRemoteUserJoined?: (uid: string) => void;
  onRemoteUserLeft?: (uid: string) => void;
  onConnectionEstablished?: () => void;
  onRemoteVideoStateChange?: (hasVideo: boolean) => void;
}

interface SignalPayload {
  from: string;
  kind: "sdp" | "ice" | "bye";
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  /** Batched trickle ICE — many candidates shipped in a single realtime message. */
  candidates?: RTCIceCandidateInit[];
}

const QUALITY_ORDER: NetworkQualityLevel[] = ["good", "fair", "poor", "critical"];

function attachStream(
  target: HTMLElement | null,
  stream: MediaStream | null,
  isLocal: boolean,
  mirror = true,
): void {
  const muted = isLocal;
  if (!target) return;
  let video = target.querySelector<HTMLVideoElement>("video[data-caakus-rtc]");
  if (!stream) {
    if (video) video.srcObject = null;
    return;
  }
  if (!video) {
    video = document.createElement("video");
    video.setAttribute("data-caakus-rtc", "1");
    video.autoplay = true;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    target.appendChild(video);
  }
  // Only the front camera is mirrored; the rear camera shows the real scene.
  video.style.transform = muted && mirror ? "scaleX(-1)" : "none";
  // Remote audio is played by a dedicated <audio> element, so the video
  // element is always muted (prevents autoplay blocking and echo).
  video.muted = true;
  if (video.srcObject !== stream) video.srcObject = stream;
  void video.play().catch(() => undefined);
}


export class CaakusWebRTCService {
  private static instance: CaakusWebRTCService;

  // Persistent local media — created once, reused for every single call.
  private localStream: MediaStream | null = null;
  private micReady = false;
  private cameraEnabled = true;
  private muted = false;
  private facingMode: "user" | "environment" = "user";
  private switchingCamera = false;


  private pc: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;
  private signalChannel: RealtimeChannel | null = null;

  private currentChannel: string | null = null;
  private selfId: string | null = null;
  private remoteId: string | null = null;
  private polite = false;

  private makingOffer = false;
  private ignoreOffer = false;
  private pendingCandidates: RTCIceCandidateInit[] = [];

  private localVideoTarget: HTMLElement | null = null;
  private remoteVideoTarget: HTMLElement | null = null;
  private remoteAudioEl: HTMLAudioElement | null = null;

  private callbacks: ConnectionCallbacks = {};
  private networkQualityHandler: ((stats: any) => void) | null = null;
  private connectionStateHandler: ((state: string, reason?: string) => void) | null = null;

  private statsTimer: any = null;
  /** Outgoing trickle ICE candidates waiting to be shipped as one message. */
  private outboundIce: RTCIceCandidateInit[] = [];
  private iceFlushTimer: any = null;
  private lastQualityLevel: NetworkQualityLevel = "good";
  private connectionEstablished = false;
  /** Échecs ICE consécutifs — pilote la bascule vers le relais TURN. */
  private iceFailures = 0;

  private micInitPromise: Promise<ServiceResult> | null = null;
  private cameraInitPromise: Promise<ServiceResult> | null = null;

  private constructor() {}

  static getInstance(): CaakusWebRTCService {
    if (!CaakusWebRTCService.instance) {
      CaakusWebRTCService.instance = new CaakusWebRTCService();
    }
    return CaakusWebRTCService.instance;
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  async initialize(): Promise<boolean> {
    return typeof window !== "undefined" && typeof RTCPeerConnection !== "undefined";
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // ==========================================================================
  // LOCAL MEDIA (never torn down between matches)
  // ==========================================================================

  async ensureMicrophoneReady(): Promise<ServiceResult> {
    if (this.micReady && this.localStream?.getAudioTracks().length) return { success: true };
    if (this.micInitPromise) return this.micInitPromise;

    this.micInitPromise = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
        const track = stream.getAudioTracks()[0];
        if (!track) return { success: false, error: "No microphone track available" };
        track.enabled = !this.muted;
        this.addLocalTrack(track);
        this.micReady = true;
        return { success: true };
      } catch (error: any) {
        const name = error?.name || "";
        const message =
          name === "NotAllowedError"
            ? "Microphone permission denied"
            : name === "NotFoundError"
              ? "No microphone detected"
              : error?.message || "Microphone unavailable";
        return { success: false, error: message };
      } finally {
        this.micInitPromise = null;
      }
    })();

    return this.micInitPromise;
  }

  async ensureCameraReady(): Promise<ServiceResult> {
    if (this.localStream?.getVideoTracks().length) return { success: true };
    if (this.cameraInitPromise) return this.cameraInitPromise;

    this.cameraInitPromise = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { ...VIDEO_CONSTRAINTS, facingMode: this.facingMode },
        });
        const track = stream.getVideoTracks()[0];
        if (!track) return { success: false, error: "audio only" };
        track.enabled = this.cameraEnabled;
        this.addLocalTrack(track);
        attachStream(this.localVideoTarget, this.localStream, true, this.facingMode === "user");
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error?.message || "Camera unavailable — audio only" };
      } finally {
        this.cameraInitPromise = null;
      }
    })();

    return this.cameraInitPromise;
  }

  getFacingMode(): "user" | "environment" {
    return this.facingMode;
  }

  /** True when the device exposes more than one camera (front + back). */
  async hasMultipleCameras(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "videoinput").length > 1;
    } catch {
      return false;
    }
  }

  /**
   * Flip between the front ("user") and the rear ("environment") camera.
   * The new track is hot-swapped into the live peer connection, so the call
   * never drops and no renegotiation round-trip is needed.
   */
  async switchCamera(): Promise<ServiceResult> {
    if (this.switchingCamera) return { success: true };
    this.switchingCamera = true;
    const previous = this.facingMode;
    const next = previous === "user" ? "environment" : "user";

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...VIDEO_CONSTRAINTS, facingMode: { exact: next } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...VIDEO_CONSTRAINTS, facingMode: next },
        });
      }

      const track = stream.getVideoTracks()[0];
      if (!track) {
        stream.getTracks().forEach((t) => t.stop());
        return { success: false, error: "No secondary camera available" };
      }

      this.facingMode = next;
      track.enabled = this.cameraEnabled;
      this.addLocalTrack(track);
      attachStream(this.localVideoTarget, this.localStream, true, this.facingMode === "user");
      return { success: true };
    } catch (error: any) {
      this.facingMode = previous;
      return { success: false, error: error?.message || "Camera switch unavailable" };
    } finally {
      this.switchingCamera = false;
    }
  }



  private addLocalTrack(track: MediaStreamTrack): void {
    if (!this.localStream) this.localStream = new MediaStream();
    this.localStream.getTracks().forEach((existing) => {
      if (existing.kind === track.kind && existing.id !== track.id) {
        existing.stop();
        this.localStream?.removeTrack(existing);
      }
    });
    this.localStream.addTrack(track);

    // Hot-swap into the live peer connection without renegotiating when possible.
    const sender = this.pc?.getSenders().find((s) => s.track?.kind === track.kind);
    if (sender) void sender.replaceTrack(track);
    else if (this.pc && this.localStream) this.pc.addTrack(track, this.localStream);
  }

  async setCameraEnabled(enabled: boolean): Promise<ServiceResult> {
    this.cameraEnabled = enabled;
    if (enabled) {
      const ready = await this.ensureCameraReady();
      if (!ready.success) return ready;
    }
    // We never stop the hardware track — we only gate it. This is what makes
    // "Next" instant instead of costing a 1-2s camera re-initialisation.
    this.localStream?.getVideoTracks().forEach((t) => {
      t.enabled = enabled;
    });
    return { success: true };
  }

  async toggleMute(muted: boolean): Promise<void> {
    this.muted = muted;
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  attachLocalVideo(target: HTMLElement | null): void {
    this.localVideoTarget = target;
    attachStream(target, this.localStream, true, this.facingMode === "user");
  }

  attachRemoteVideo(target: HTMLElement | null): void {
    this.remoteVideoTarget = target;
    attachStream(target, this.remoteStream, false);
    if (this.remoteStream) this.attachRemoteAudio(this.remoteStream);
  }

  /**
   * Remote audio plays through its own dedicated <audio> element so the voice
   * is never gated by the video element's lifecycle (autoplay blocking,
   * re-mounts, hidden containers). This is what makes sound work instantly.
   */
  private attachRemoteAudio(stream: MediaStream): void {
    if (typeof document === "undefined") return;
    let el = this.remoteAudioEl;
    if (!el) {
      el = document.createElement("audio");
      el.setAttribute("data-caakus-rtc-audio", "1");
      el.autoplay = true;
      (el as any).playsInline = true;
      el.style.display = "none";
      document.body.appendChild(el);
      this.remoteAudioEl = el;
    }
    el.muted = false;
    el.volume = 1;
    if (el.srcObject !== stream) el.srcObject = stream;
    void el.play().catch(() => undefined);
  }


  getRemoteVideoTrack(): { play: (el: HTMLElement) => void; stop: () => void } | null {
    if (!this.remoteStream || this.remoteStream.getVideoTracks().length === 0) return null;
    return {
      play: (el: HTMLElement) => attachStream(el, this.remoteStream, false),
      stop: () => attachStream(this.remoteVideoTarget, null, false),
    };
  }

  /** Signaling presence only — NEVER use this to display a "Connected" state. */
  hasRemoteUsersPresent(): boolean {
    return Boolean(this.remoteId);
  }

  /** True only when the real P2P transport is established. */
  isPeerConnected(): boolean {
    return this.pc?.connectionState === "connected";
  }


  // ==========================================================================
  // SIGNALING + PEER CONNECTION
  // ==========================================================================

  async joinChannel(
    roomName: string,
    userId: string,
    onRemoteUserJoined?: (uid: string) => void,
    onRemoteUserLeft?: (uid: string) => void,
    onConnectionEstablished?: () => void,
    onRemoteVideoStateChange?: (hasVideo: boolean) => void,
    _isGuest: boolean = false,
  ): Promise<boolean> {
    try {
      await this.leaveChannel();

      this.callbacks = { onRemoteUserJoined, onRemoteUserLeft, onConnectionEstablished, onRemoteVideoStateChange };
      this.currentChannel = roomName;
      this.selfId = userId;
      this.remoteId = null;
      this.connectionEstablished = false;
      this.iceFailures = 0;
      this.pendingCandidates = [];

      // Local media MUST exist before the peer connection is created, otherwise
      // the audio track is added after the first offer and stays silent until
      // the user manually toggles the microphone.
      await this.ensureMicrophoneReady();
      if (this.cameraEnabled) await this.ensureCameraReady();

      this.createPeerConnection();


      const channel = supabase.channel(`rtc:${roomName}`, {
        config: { broadcast: { self: false, ack: false }, presence: { key: userId } },
      });
      this.signalChannel = channel;

      channel.on("broadcast", { event: "signal" }, ({ payload }) => {
        void this.handleSignal(payload as SignalPayload);
      });

      channel.on("presence", { event: "sync" }, () => {
        const peers = Object.keys(channel.presenceState()).filter((k) => k !== userId);
        const peer = peers[0];
        if (!peer || peer === this.remoteId) return;
        this.remoteId = peer;
        // Deterministic role assignment — identical on both devices, zero glare.
        this.polite = userId < peer;
        this.callbacks.onRemoteUserJoined?.(peer);
        if (!this.polite) void this.negotiate();
      });

      channel.on("presence", { event: "leave" }, ({ key }) => {
        if (key !== this.remoteId) return;
        const left = this.remoteId;
        this.remoteId = null;
        this.setRemoteStream(null);
        if (left) this.callbacks.onRemoteUserLeft?.(left);
      });

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Signaling subscribe timeout")), 8000);
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            reject(new Error(`Signaling failed: ${status}`));
          }
        });
      });

      await channel.track({ uid: userId, at: Date.now() });

      this.startStatsLoop();
      return true;
    } catch (error) {
      console.error("❌ WebRTC join failed:", error);
      this.connectionStateHandler?.("FAILED", (error as Error)?.message);
      return false;
    }
  }

  async switchChannel(
    newRoomName: string,
    userId: string,
    onRemoteUserJoined?: (uid: string) => void,
    onRemoteUserLeft?: (uid: string) => void,
    onConnectionEstablished?: () => void,
    onRemoteVideoStateChange?: (hasVideo: boolean) => void,
    isGuest: boolean = false,
  ): Promise<boolean> {
    return this.joinChannel(
      newRoomName,
      userId,
      onRemoteUserJoined,
      onRemoteUserLeft,
      onConnectionEstablished,
      onRemoteVideoStateChange,
      isGuest,
    );
  }

  async leaveChannel(): Promise<void> {
    this.stopStatsLoop();

    // Drop any queued ICE so nothing is published onto a channel we are about
    // to destroy (zombie-message guard).
    if (this.iceFlushTimer) {
      clearTimeout(this.iceFlushTimer);
      this.iceFlushTimer = null;
    }
    this.outboundIce = [];

    if (this.signalChannel) {
      try {
        await this.signalChannel.send({
          type: "broadcast",
          event: "signal",
          payload: { from: this.selfId, kind: "bye" } as SignalPayload,
        });
      } catch {
        /* best-effort */
      }
      try {
        await supabase.removeChannel(this.signalChannel);
      } catch {
        /* best-effort */
      }
      this.signalChannel = null;
    }

    this.closePeerConnection();
    this.currentChannel = null;
    this.remoteId = null;
    this.connectionEstablished = false;
    // NOTE: localStream is deliberately preserved.
  }

  private createPeerConnection(): void {
    // P2P FIRST: the relay (TURN) is a last resort only, after several ICE
    // failures in a row. Direct UDP is always attempted first.
    const config: RTCConfiguration =
      this.iceFailures >= 4 ? { ...PEER_CONNECTION_CONFIG, iceTransportPolicy: "relay" } : PEER_CONNECTION_CONFIG;
    const pc = new RTCPeerConnection(config);
    this.pc = pc;
    this.remoteStream = new MediaStream();

    this.localStream?.getTracks().forEach((track) => pc.addTrack(track, this.localStream!));

    // ---- Trickle ICE: ship every candidate the instant it is gathered ----
    pc.onicecandidate = ({ candidate }) => {
      // End-of-candidates: ship whatever is still queued immediately.
      if (!candidate) {
        this.flushIce();
        return;
      }
      this.queueIce(candidate.toJSON());
    };

    pc.ontrack = ({ track, streams, receiver }) => {
      const stream = streams[0] ?? this.remoteStream!;
      if (!stream.getTracks().includes(track)) stream.addTrack(track);
      this.setRemoteStream(stream);
      // Zero-buffer playout: real-time voice, no 3-5s jitter buffer build-up.
      try {
        const r = receiver as any;
        if ("playoutDelayHint" in r) r.playoutDelayHint = 0;
        if ("jitterBufferTarget" in r) r.jitterBufferTarget = 0;
      } catch {
        /* not supported everywhere */
      }
      if (track.kind === "audio") {
        this.attachRemoteAudio(stream);
      }
      if (track.kind === "video") {
        this.callbacks.onRemoteVideoStateChange?.(true);
        track.onmute = () => this.callbacks.onRemoteVideoStateChange?.(false);
        track.onunmute = () => this.callbacks.onRemoteVideoStateChange?.(true);
        track.onended = () => this.callbacks.onRemoteVideoStateChange?.(false);
      }
    };

    pc.onnegotiationneeded = () => {
      if (this.polite) return;
      void this.negotiate();
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        this.iceFailures = 0;
        return;
      }
      if (pc.iceConnectionState !== "failed") return;

      this.iceFailures += 1;
      this.connectionStateHandler?.("RECONNECTING", "ice-failed");

      if (this.iceFailures < 4) {
        try {
          pc.restartIce();
          return;
        } catch {
          /* older browsers */
        }
      }

      // Dernier recours seulement : reconstruction du pair en relais TURN.
      if (this.iceFailures <= 6 && this.currentChannel) {

        this.closePeerConnection();
        this.createPeerConnection();
        if (!this.polite) void this.negotiate();
      } else {
        this.connectionStateHandler?.("DISCONNECTED", "ice-exhausted");
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        if (!this.connectionEstablished) {
          this.connectionEstablished = true;
          this.callbacks.onConnectionEstablished?.();
        }
        this.connectionStateHandler?.("CONNECTED");
      } else if (state === "disconnected") {
        this.connectionStateHandler?.("RECONNECTING", "ice-disconnected");
      } else if (state === "failed" || state === "closed") {
        this.connectionStateHandler?.("DISCONNECTED", state);
      }
    };
  }

  private setRemoteStream(stream: MediaStream | null): void {
    this.remoteStream = stream;
    attachStream(this.remoteVideoTarget, stream, false);
    if (stream) this.attachRemoteAudio(stream);
    else if (this.remoteAudioEl) this.remoteAudioEl.srcObject = null;
    if (!stream) this.callbacks.onRemoteVideoStateChange?.(false);
  }

  private closePeerConnection(): void {
    if (!this.pc) return;
    try {
      this.pc.getSenders().forEach((s) => {
        try {
          this.pc?.removeTrack(s);
        } catch {
          /* noop */
        }
      });
      this.pc.onicecandidate = null;
      this.pc.ontrack = null;
      this.pc.onnegotiationneeded = null;
      this.pc.onconnectionstatechange = null;
      this.pc.close();
    } catch {
      /* noop */
    }
    this.pc = null;
    this.setRemoteStream(null);
  }

  /**
   * Trickle ICE is still trickle — but coalesced. A browser emits 15-40
   * candidates per negotiation; sending each one as its own realtime message
   * was the single biggest source of Realtime message volume. We buffer for
   * one animation-frame-ish window (120ms) and ship them as one message,
   * which cuts signaling traffic by ~90% with no measurable setup delay.
   */
  private queueIce(candidate: RTCIceCandidateInit): void {
    this.outboundIce.push(candidate);
    if (this.iceFlushTimer) return;
    this.iceFlushTimer = setTimeout(() => this.flushIce(), 120);
  }

  private flushIce(): void {
    if (this.iceFlushTimer) {
      clearTimeout(this.iceFlushTimer);
      this.iceFlushTimer = null;
    }
    if (this.outboundIce.length === 0) return;
    const candidates = this.outboundIce.splice(0);
    void this.sendSignal({ from: this.selfId!, kind: "ice", candidates });
  }

  private async sendSignal(payload: SignalPayload): Promise<void> {
    if (!this.signalChannel) return;
    try {
      await this.signalChannel.send({ type: "broadcast", event: "signal", payload });
    } catch (error) {
      console.warn("Signal send failed", error);
    }
  }

  private async negotiate(): Promise<void> {
    const pc = this.pc;
    if (!pc || !this.remoteId) return;
    try {
      this.makingOffer = true;
      await pc.setLocalDescription();
      if (pc.localDescription) {
        await this.sendSignal({ from: this.selfId!, kind: "sdp", description: pc.localDescription.toJSON() });
      }
    } catch (error) {
      console.warn("Negotiation failed", error);
    } finally {
      this.makingOffer = false;
    }
  }

  /** Perfect negotiation — safe under simultaneous "Next" storms. */
  private async handleSignal(payload: SignalPayload): Promise<void> {
    const pc = this.pc;
    if (!pc || !payload || payload.from === this.selfId) return;

    if (payload.kind === "bye") {
      const left = this.remoteId;
      this.remoteId = null;
      this.setRemoteStream(null);
      if (left) this.callbacks.onRemoteUserLeft?.(left);
      return;
    }

    if (!this.remoteId) {
      this.remoteId = payload.from;
      this.polite = (this.selfId ?? "") < payload.from;
      this.callbacks.onRemoteUserJoined?.(payload.from);
    }

    try {
      if (payload.kind === "sdp" && payload.description) {
        const description = payload.description;
        const offerCollision =
          description.type === "offer" && (this.makingOffer || pc.signalingState !== "stable");
        this.ignoreOffer = !this.polite && offerCollision;
        if (this.ignoreOffer) return;

        if (offerCollision) {
          await pc.setRemoteDescription(description);
        } else {
          await pc.setRemoteDescription(description);
        }

        for (const candidate of this.pendingCandidates.splice(0)) {
          await pc.addIceCandidate(candidate).catch(() => undefined);
        }

        if (description.type === "offer") {
          await pc.setLocalDescription();
          if (pc.localDescription) {
            await this.sendSignal({ from: this.selfId!, kind: "sdp", description: pc.localDescription.toJSON() });
          }
        }
      } else if (payload.kind === "ice") {
        // Accept both the batched form and the legacy single-candidate form so
        // a client running the previous build still connects during rollout.
        const incoming = payload.candidates ?? (payload.candidate ? [payload.candidate] : []);
        if (incoming.length === 0) return;
        if (!pc.remoteDescription) {
          this.pendingCandidates.push(...incoming);
          return;
        }
        for (const candidate of incoming) {
          await pc.addIceCandidate(candidate).catch((err) => {
            if (!this.ignoreOffer) console.warn("ICE candidate rejected", err);
          });
        }
      }
    } catch (error) {
      console.warn("Signal handling error", error);
    }
  }

  // ==========================================================================
  // QUALITY TELEMETRY + ADAPTIVE BITRATE
  // ==========================================================================

  private startStatsLoop(): void {
    this.stopStatsLoop();
    this.statsTimer = setInterval(() => void this.sampleStats(), 2000);
  }

  private stopStatsLoop(): void {
    if (this.statsTimer) clearInterval(this.statsTimer);
    this.statsTimer = null;
  }

  private async sampleStats(): Promise<void> {
    const pc = this.pc;
    if (!pc || !this.networkQualityHandler) return;
    try {
      const report = await pc.getStats();
      let rtt = 0;
      let outboundLoss = 0;
      let inboundLoss = 0;

      report.forEach((stat: any) => {
        if (stat.type === "candidate-pair" && stat.state === "succeeded" && stat.currentRoundTripTime) {
          rtt = Math.max(rtt, stat.currentRoundTripTime * 1000);
        }
        if (stat.type === "remote-inbound-rtp" && typeof stat.fractionLost === "number") {
          outboundLoss = Math.max(outboundLoss, stat.fractionLost);
        }
        if (stat.type === "inbound-rtp" && typeof stat.packetsLost === "number" && stat.packetsReceived) {
          inboundLoss = Math.max(inboundLoss, stat.packetsLost / (stat.packetsLost + stat.packetsReceived));
        }
      });

      const score = (loss: number) => {
        const base = rtt > 500 ? 5 : rtt > 300 ? 4 : rtt > 180 ? 3 : rtt > 90 ? 2 : 1;
        const penalty = loss > 0.15 ? 3 : loss > 0.08 ? 2 : loss > 0.03 ? 1 : 0;
        return Math.min(6, base + penalty);
      };

      const uplinkNetworkQuality = score(outboundLoss);
      const downlinkNetworkQuality = score(inboundLoss);
      this.networkQualityHandler({ uplinkNetworkQuality, downlinkNetworkQuality, rtt });
      void this.applyNetworkQuality(uplinkNetworkQuality, downlinkNetworkQuality);
    } catch {
      /* telemetry is best-effort */
    }
  }

  async applyNetworkQuality(uplink: number, downlink: number): Promise<void> {
    const worst = Math.max(uplink || 0, downlink || 0);
    const level: NetworkQualityLevel =
      worst >= 6 ? "critical" : worst >= 5 ? "poor" : worst >= 3 ? "fair" : "good";
    if (level === this.lastQualityLevel) return;
    this.lastQualityLevel = level;

    const sender = this.pc?.getSenders().find((s) => s.track?.kind === "video");
    if (!sender) return;
    try {
      const params = sender.getParameters();
      if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
      params.encodings[0]!.maxBitrate = VIDEO_BITRATE_LADDER[level];
      params.encodings[0]!.scaleResolutionDownBy =
        QUALITY_ORDER.indexOf(level) >= 2 ? 2 : 1;
      await sender.setParameters(params);
    } catch {
      /* not fatal */
    }
  }

  setNetworkQualityHandler(handler: ((stats: any) => void) | null): void {
    this.networkQualityHandler = handler;
  }

  setConnectionStateHandler(handler: ((state: string, reason?: string) => void) | null): void {
    this.connectionStateHandler = handler;
  }

  async destroy(force: boolean = false): Promise<void> {
    await this.leaveChannel();
    if (force) {
      this.localStream?.getTracks().forEach((t) => t.stop());
      this.localStream = null;
      this.micReady = false;
      this.localVideoTarget = null;
      this.remoteVideoTarget = null;
    }
  }
}

export const webrtcService = CaakusWebRTCService.getInstance();
export default CaakusWebRTCService;
