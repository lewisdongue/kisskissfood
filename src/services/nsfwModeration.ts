/**
 * CAAKUS PRECISION MODERATION
 * ============================================================================
 * 100% client-side, zero server cost, no frame ever leaves the device.
 *
 * Scope is deliberately narrow — it reacts to TWO things only:
 *   1. Explicit exposure of human genitals (NSFWJS "Porn" / "Hentai" at >= 99%).
 *   2. Severe violence with visible blood (large, irregular, deep-red regions).
 *
 * Everything else is ignored by design: clothed users, faces, swimwear or
 * "Sexy" frames, fast movement, dark rooms, warm lighting, skin tone, audio.
 * The microphone is never touched by this module.
 *
 * A violation requires the SAME signal on every consecutive sample for at
 * least 1 full second. A single clean frame resets the counter to zero.
 */

import { supabase } from "../config/supabase";

type NsfwModel = { classify: (input: HTMLCanvasElement) => Promise<Array<{ className: string; probability: number }>> };

/** Only these two classes describe explicit genital exposure. "Sexy" is intentionally excluded. */
const EXPLICIT_CLASSES = new Set(["Porn", "Hentai"]);
/** Certainty required before anything happens. Nothing below this is ever acted on. */
const ACTION_THRESHOLD = 0.99;
/** One sample per second keeps moderation active without starving call controls on mobile. */
const SAMPLE_INTERVAL_MS = 1000;
const SUSTAINED_MS = 1000;
/** Dark / low-signal frames are never classified — sensor grain fools any model. */
const MIN_LUMINANCE = 45;
const MIN_CONTRAST = 25;

/* ── Blood heuristics ──────────────────────────────────────────────────────
 * Blood = deep, desaturated-dark red, in irregular patches with high local
 * texture. Red clothing, red lighting and red backgrounds are flat and
 * uniform, so the irregularity test filters them out.                      */
const BLOOD_MIN_RATIO = 0.1; // at least 10% of the frame
const BLOOD_MAX_RATIO = 0.55; // more than half red = red wall / red light, not blood
const BLOOD_MIN_IRREGULARITY = 0.22; // edge density inside the red mask

let modelPromise: Promise<NsfwModel | null> | null = null;

async function loadModel(): Promise<NsfwModel | null> {
  if (typeof window === "undefined") return null;
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const [{ load }] = await Promise.all([import("nsfwjs"), import("@tensorflow/tfjs")]);
        return (await load()) as unknown as NsfwModel;
      } catch (error) {
        console.warn("NSFW model unavailable:", error);
        return null;
      }
    })();
  }
  return modelPromise;
}

/** Warm the model up during idle time so the first call is never delayed. */
export function preloadModerationModel(): void {
  if (typeof window === "undefined") return;
  const idle = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
  idle(() => void loadModel());
}

export type ViolationKind = "nudity" | "blood";

export interface ModerationOptions {
  /** Local user id — used for the moderation record. */
  userId: string;
  roomName?: string | null;
  /** Which side is being analysed. */
  subject: "local" | "remote";
  /** Called once, when a violation is confirmed at >= 99% for >= 1 consecutive second. */
  onViolation: (reason: string, kind: ViolationKind) => void;
}

export interface ModerationHandle {
  stop: () => void;
}

async function reportViolation(userId: string, roomName: string | null | undefined, reason: string) {
  try {
    await supabase.from("moderation_events").insert({
      user_id: userId,
      room_name: roomName ?? null,
      reason,
      source: "nsfwjs-client",
      banned_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.warn("Moderation report failed", error);
  }
}

export function startNsfwWatch(video: HTMLVideoElement, options: ModerationOptions): ModerationHandle {
  let stopped = false;
  let busy = false;
  /** Timestamp of the first sample of the current unbroken violation run. */
  let runStartedAt = 0;
  let runKind: ViolationKind | null = null;

  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const analyseFrame = () => {
    const { data } = ctx!.getImageData(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    const pixels = w * h;

    let sum = 0;
    let sumSq = 0;
    const mask = new Uint8Array(pixels);
    let redCount = 0;

    for (let p = 0; p < pixels; p++) {
      const i = p * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += luminance;
      sumSq += luminance * luminance;

      // Deep blood red: strongly red-dominant, not pink skin, not bright signage red.
      const isBloodRed = r > 70 && r < 220 && r > g * 2.6 && r > b * 2.6 && g < 90 && b < 90;
      if (isBloodRed) {
        mask[p] = 1;
        redCount++;
      }
    }

    const mean = sum / pixels;
    const contrast = Math.sqrt(Math.max(0, sumSq / pixels - mean * mean));
    const usable = mean >= MIN_LUMINANCE && contrast >= MIN_CONTRAST;
    const redRatio = redCount / pixels;

    // Only run the second full-frame pass when the inexpensive ratio check says
    // blood is plausible. This removes needless work from almost every frame.
    let boundary = 0;
    if (usable && redRatio >= BLOOD_MIN_RATIO && redRatio <= BLOOD_MAX_RATIO) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const p = y * w + x;
          if (!mask[p]) continue;
          if (!mask[p - 1] || !mask[p + 1] || !mask[p - w] || !mask[p + w]) boundary++;
        }
      }
    }
    const irregularity = redCount > 0 ? boundary / redCount : 0;

    const bloodLike =
      usable &&
      redRatio >= BLOOD_MIN_RATIO &&
      redRatio <= BLOOD_MAX_RATIO &&
      irregularity >= BLOOD_MIN_IRREGULARITY;

    return { usable, bloodLike, redRatio, irregularity };
  };

  const timer = setInterval(async () => {
    if (stopped || busy || !ctx) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;
    const scheduling = navigator as Navigator & {
      scheduling?: { isInputPending?: () => boolean };
    };
    // A pending tap always wins over background video analysis.
    if (scheduling.scheduling?.isInputPending?.()) return;
    busy = true;
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = analyseFrame();

      if (!frame.usable) {
        runStartedAt = 0;
        runKind = null;
        return;
      }

      let kind: ViolationKind | null = null;
      let reason = "";

      const model = await loadModel();
      if (model && !stopped) {
        const predictions = await model.classify(canvas);
        const hit = predictions
          .filter((p) => EXPLICIT_CLASSES.has(p.className))
          .sort((a, b) => b.probability - a.probability)[0];
        if (hit && hit.probability >= ACTION_THRESHOLD) {
          kind = "nudity";
          reason = `explicit-nudity ${hit.className} ${Math.round(hit.probability * 100)}%`;
        }
      }

      if (!kind && frame.bloodLike) {
        kind = "blood";
        reason = `severe-violence blood ${Math.round(frame.redRatio * 100)}% irr ${frame.irregularity.toFixed(2)}`;
      }

      if (!kind) {
        runStartedAt = 0;
        runKind = null;
        return;
      }

      if (runKind !== kind) {
        runKind = kind;
        runStartedAt = Date.now();
        return;
      }

      if (Date.now() - runStartedAt < SUSTAINED_MS) return;

      stopped = true;
      clearInterval(timer);
      if (options.subject === "local") {
        void reportViolation(options.userId, options.roomName, reason);
      }
      options.onViolation(reason, kind);
    } catch {
      /* never break the call because of moderation */
    } finally {
      busy = false;
    }
  }, SAMPLE_INTERVAL_MS);

  return {
    stop: () => {
      stopped = true;
      clearInterval(timer);
    },
  };
}
