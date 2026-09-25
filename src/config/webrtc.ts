/**
 * CAAKUS WEBRTC CONFIGURATION
 *
 * Personal STUN/TURN infrastructure (Hetzner) — no third-party RTC vendor.
 * Trickle ICE is always enabled: the first reachable candidate wins.
 */

export const CAAKUS_TURN_HOST = "turn.caakus.com";

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: `stun:${CAAKUS_TURN_HOST}:3478` },
  {
    urls: [
      `turn:${CAAKUS_TURN_HOST}:3478?transport=udp`,
      `turn:${CAAKUS_TURN_HOST}:3478?transport=tcp`,
      `turns:${CAAKUS_TURN_HOST}:5349?transport=tcp`,
    ],
    username: "caakus_user",
    credential: "caakus_secure_password_2026",
  },
];

/**
 * Peer connection config tuned for sub-200ms first frame:
 * - `iceCandidatePoolSize` pre-gathers candidates before the match even exists.
 * - `bundlePolicy: max-bundle` + `rtcpMuxPolicy: require` = one single transport.
 */
export const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 4,
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
  iceTransportPolicy: "all",
};

/** Premium voice pipeline — the three essentials, natively handled by the browser DSP. */
export const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,
  sampleRate: 48000,
  // Real-time voice: ask the capture pipeline for the smallest possible buffer.
  latency: { ideal: 0 },
} as MediaTrackConstraints;


export const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 480, max: 720 },
  frameRate: { ideal: 24, max: 30 },
  facingMode: "user",
};

/** Adaptive bitrate ladder driven by live getStats() telemetry. */
export const VIDEO_BITRATE_LADDER = {
  good: 900_000,
  fair: 600_000,
  poor: 320_000,
  critical: 150_000,
} as const;

export type NetworkQualityLevel = keyof typeof VIDEO_BITRATE_LADDER;
