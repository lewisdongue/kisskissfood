// ═══════════════════════════════════════════════════════════════════
// Muted haptic-audio feedback layer (Web Audio API).
// Soft, felted, sub-100ms cues that amplify the dopamine loop without
// ever sounding like a notification. Purely presentational — it never
// blocks, throws, or interferes with application logic.
// ═══════════════════════════════════════════════════════════════════

type Cue = "tap" | "engage" | "match" | "dismiss";

let ctx: AudioContext | null = null;
let muted = false;

const PROFILE: Record<Cue, { freq: number; to: number; dur: number; gain: number; type: OscillatorType }> = {
  tap: { freq: 520, to: 460, dur: 0.06, gain: 0.035, type: "sine" },
  engage: { freq: 340, to: 720, dur: 0.16, gain: 0.055, type: "sine" },
  match: { freq: 620, to: 980, dur: 0.22, gain: 0.05, type: "triangle" },
  dismiss: { freq: 420, to: 260, dur: 0.1, gain: 0.03, type: "sine" },
};

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setUiSoundMuted(next: boolean) {
  muted = next;
}

export function isUiSoundMuted() {
  return muted;
}

export function playCue(cue: Cue = "tap") {
  if (muted) return;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const audio = getContext();
  if (!audio) return;
  try {
    const p = PROFILE[cue];
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, now);

    osc.type = p.type;
    osc.frequency.setValueAtTime(p.freq, now);
    osc.frequency.exponentialRampToValueAtTime(p.to, now + p.dur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(p.gain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

    osc.connect(filter).connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + p.dur + 0.02);
  } catch {
    /* audio is a bonus, never a dependency */
  }
}
