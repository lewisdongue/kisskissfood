import { useEffect, useRef } from "react";

/** "Hey, you are unique" — the Caakus brand jingle, localised. */
export const GREETINGS: Record<string, string> = {
  en: "Hey, you are unique.",
  fr: "Hey, tu es unique.",
  es: "Hola, eres único.",
  de: "Hey, du bist einzigartig.",
  pt: "Oi, você é único.",
  ar: "مرحبًا، أنت فريد.",
  zh: "嘿，你是独一无二的。",
  hi: "नमस्ते, आप अद्वितीय हैं।",
  yo: "Bawo, o jẹ́ àrà ọ̀tọ̀.",
  ig: "Ndewo, ị bụ ihe pụrụ iche.",
  ha: "Sannu, kai na musamman ne.",
};

const PLAYS_KEY = "caakus_greeting_plays";
const CYCLE_KEY = "caakus_greeting_cycle";
const LIMIT_KEY = "caakus_greeting_daily_limit";

/** Plays allowed back-to-back (one per open/refresh) before the cycle pauses. */
export const CYCLE_MAX = 3;
/** The cycle of 3 restarts every 8 hours. */
const CYCLE_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_DAILY_LIMIT = 6;

/** User-configurable ceiling: how many times per day the jingle may speak (0–8). */
export function getGreetingDailyLimit(): number {
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    if (raw === null) return DEFAULT_DAILY_LIMIT;
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return DEFAULT_DAILY_LIMIT;
    return Math.min(8, Math.max(0, n));
  } catch {
    return DEFAULT_DAILY_LIMIT;
  }
}

export function setGreetingDailyLimit(value: number) {
  try {
    localStorage.setItem(LIMIT_KEY, String(Math.min(8, Math.max(0, Math.round(value)))));
  } catch {
    /* private mode */
  }
}

function readPlays(): number[] {
  try {
    const raw = localStorage.getItem(PLAYS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((v): v is number => typeof v === "number" && now - v < DAY_MS);
  } catch {
    return [];
  }
}

function readCycle(): { start: number; count: number } {
  try {
    const raw = localStorage.getItem(CYCLE_KEY);
    if (!raw) return { start: 0, count: 0 };
    const parsed = JSON.parse(raw) as { start?: number; count?: number };
    return { start: Number(parsed?.start) || 0, count: Number(parsed?.count) || 0 };
  } catch {
    return { start: 0, count: 0 };
  }
}

function recordPlay() {
  const now = Date.now();
  const cycle = readCycle();
  const fresh = !cycle.start || now - cycle.start >= CYCLE_MS;
  try {
    localStorage.setItem(PLAYS_KEY, JSON.stringify([...readPlays(), now]));
    localStorage.setItem(
      CYCLE_KEY,
      JSON.stringify(fresh ? { start: now, count: 1 } : { start: cycle.start, count: cycle.count + 1 }),
    );
  } catch {
    /* private mode — the jingle simply falls back to session behaviour */
  }
}

/**
 * The jingle may speak once per app open / refresh, up to 3 times in a row.
 * That cycle of 3 restarts 8 hours after it began, and a user-set daily
 * ceiling (0–8, Settings) always wins.
 */
export function isGreetingAllowed(): boolean {
  const limit = getGreetingDailyLimit();
  if (limit <= 0) return false;
  if (readPlays().length >= limit) return false;

  const cycle = readCycle();
  if (!cycle.start) return true;
  if (Date.now() - cycle.start >= CYCLE_MS) return true; // new 8h cycle
  return cycle.count < CYCLE_MAX;
}

/**
 * Brand jingle: plays "Hey, you are unique" in the visitor's language at every
 * app open or refresh (max 3 in a row per 8h cycle, capped by the user's daily
 * setting). Identical behaviour for guests and signed-in users.
 */
export function VoiceGreeting() {
  const playedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isGreetingAllowed()) return;

    const lang = (navigator.language || "en").split("-")[0];
    const supported = Object.hasOwn(GREETINGS, lang) ? lang : "en";
    const audio = new Audio(`/audio/greetings/${supported}.mp3`);
    audio.preload = "auto";
    audio.volume = 0.9;
    audio.load();

    let disposed = false;

    const cleanupListeners = () => {
      document.removeEventListener("pointerdown", onInteract, true);
      document.removeEventListener("touchstart", onInteract, true);
      document.removeEventListener("click", onInteract, true);
      document.removeEventListener("keydown", onInteract, true);
    };

    const speakLocally = () => {
      if (!("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(GREETINGS[supported] ?? GREETINGS["en"]!);
      utterance.lang = navigator.language || supported;
      utterance.rate = 0.95;
      utterance.pitch = 1.08;
      utterance.volume = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(`${supported}-`));
      utterance.voice =
        matching.find((v) => /female|woman|samantha|amelie|audrey|victoria|ava/i.test(v.name)) ??
        matching[0] ??
        null;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const play = () => {
      if (playedRef.current || disposed) return;
      playedRef.current = true;
      cleanupListeners();
      recordPlay();
      void audio.play().catch(() => speakLocally());
    };

    function onInteract(event: Event) {
      if ("isTrusted" in event && !event.isTrusted) return;
      play();
    }

    // Try immediately (allowed when the browser already trusts this origin),
    // otherwise the very first real gesture triggers it.
    void audio
      .play()
      .then(() => {
        if (!playedRef.current && !disposed) {
          playedRef.current = true;
          cleanupListeners();
          recordPlay();
        }
      })
      .catch(() => {
        /* autoplay blocked — wait for the first gesture */
      });

    document.addEventListener("pointerdown", onInteract, { capture: true, passive: true });
    document.addEventListener("touchstart", onInteract, { capture: true, passive: true });
    document.addEventListener("click", onInteract, true);
    document.addEventListener("keydown", onInteract, true);

    return () => {
      disposed = true;
      cleanupListeners();
      audio.pause();
      audio.src = "";
    };
  }, []);

  return null;
}

export default VoiceGreeting;
