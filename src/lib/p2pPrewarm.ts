// ═══════════════════════════════════════════════════════════════════════════
// P2P PRE-WARM
// Hovering a primary discovery button quietly performs the slowest part of a
// WebRTC connection (ICE gathering against STUN) ahead of the click, so the
// real match starts with candidates already in hand.
// Fire-and-forget, throttled, never blocks or changes UI state.
// ═══════════════════════════════════════════════════════════════════════════

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] },
];

const WARM_TTL_MS = 60_000;

type Warm = { at: number; candidates: RTCIceCandidateInit[] };

let warm: Warm | null = null;
let inflight = false;

export function isPrewarmed(): boolean {
  return !!warm && Date.now() - warm.at < WARM_TTL_MS;
}

/** Cached local ICE candidates, if the pre-warm is still fresh. */
export function prewarmedCandidates(): RTCIceCandidateInit[] | null {
  return isPrewarmed() ? warm!.candidates : null;
}

/** Idempotent, safe to call on every hover / touchstart / focus. */
export function prewarmP2P(): void {
  if (typeof window === "undefined" || typeof RTCPeerConnection === "undefined") return;
  if (inflight || isPrewarmed()) return;
  inflight = true;

  let pc: RTCPeerConnection | null = null;
  const candidates: RTCIceCandidateInit[] = [];

  const finish = () => {
    if (!pc) return;
    warm = { at: Date.now(), candidates };
    try {
      pc.close();
    } catch {
      /* noop */
    }
    pc = null;
    inflight = false;
  };

  try {
    pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 2 });
    pc.createDataChannel("prewarm");
    pc.onicecandidate = (event) => {
      if (event.candidate) candidates.push(event.candidate.toJSON());
      else finish();
    };
    pc.createOffer()
      .then((offer) => pc?.setLocalDescription(offer))
      .catch(finish);
    window.setTimeout(finish, 2_500);
  } catch {
    inflight = false;
  }
}

/** Props spread onto any primary CTA to enable hover pre-connection. */
export const prewarmHandlers = {
  onMouseEnter: prewarmP2P,
  onFocus: prewarmP2P,
  onTouchStart: prewarmP2P,
} as const;
