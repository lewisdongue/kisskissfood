/**
 * DAILY NOTIFICATION SCHEDULER — 8 rappels par jour
 * ============================================================================
 * 2 le matin, 2 à midi, 2 le soir, 2 avant de dormir (heure locale).
 * 100% client-side : utilise le service worker (ou l'API Notification) et
 * déduplique via localStorage pour ne jamais envoyer deux fois le même slot.
 */

export interface DailySlot {
  /** Heure locale, 0-23 */
  hour: number;
  minute: number;
  title: string;
  body: string;
}

export const DAILY_SLOTS: DailySlot[] = [
  { hour: 8, minute: 0, title: "☀️ Good morning", body: "Someone new is waiting to meet you on Caakus." },
  { hour: 9, minute: 30, title: "🎁 Daily bonus ready", body: "Claim your Yuyu bonus before it expires." },
  { hour: 12, minute: 0, title: "👋 Lunch break?", body: "One tap = one real human. Start a call now." },
  { hour: 13, minute: 30, title: "🔥 Keep your streak alive", body: "A 2-minute call keeps your streak going." },
  { hour: 18, minute: 0, title: "🌍 Peak hours", body: "Thousands of people are online right now." },
  { hour: 19, minute: 30, title: "🏆 Climb the leaderboard", body: "You're close to your next Yuyu milestone." },
  { hour: 21, minute: 30, title: "💬 Late-night talks", body: "The best conversations happen at night." },
  { hour: 22, minute: 30, title: "🌙 One last connection", body: "End your day with someone new on Caakus." },
];

const STORAGE_KEY = "caakus_daily_notifications_sent";
const OPT_OUT_KEY = "caakus_daily_notifications_disabled";
const CHECK_INTERVAL_MS = 60_000;
/** On ne déclenche un slot que s'il est passé depuis moins de 45 minutes. */
const SLOT_GRACE_MS = 45 * 60_000;

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function readSent(): { day: string; slots: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.day === "string" && Array.isArray(parsed.slots)) return parsed;
  } catch {
    /* corrupted storage — reset silently */
  }
  return { day: dayKey(new Date()), slots: [] };
}

function writeSent(state: { day: string; slots: string[] }): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function setDailyNotificationsEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(OPT_OUT_KEY);
    else localStorage.setItem(OPT_OUT_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function areDailyNotificationsEnabled(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) !== "1";
  } catch {
    return true;
  }
}

async function show(slot: DailySlot): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const options: NotificationOptions = {
    body: slot.body,
    icon: "/logo_128.png",
    badge: "/logo_128.png",
    tag: `caakus-daily-${slot.hour}-${slot.minute}`,
    data: { url: "/call" },
  };

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(slot.title, options);
      return true;
    }
    new Notification(slot.title, options);
    return true;
  } catch {
    return false;
  }
}

async function tick(): Promise<void> {
  if (!areDailyNotificationsEnabled()) return;
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  // Ne jamais notifier pendant que l'utilisateur regarde déjà l'app.
  if (document.visibilityState === "visible") return;

  const now = new Date();
  const today = dayKey(now);
  const state = readSent();
  if (state.day !== today) {
    state.day = today;
    state.slots = [];
  }

  for (const slot of DAILY_SLOTS) {
    const id = `${slot.hour}:${slot.minute}`;
    if (state.slots.includes(id)) continue;

    const slotTime = new Date(now);
    slotTime.setHours(slot.hour, slot.minute, 0, 0);
    const delta = now.getTime() - slotTime.getTime();
    if (delta < 0 || delta > SLOT_GRACE_MS) continue;

    const ok = await show(slot);
    // Marqué dans tous les cas : on n'insiste jamais sur un slot manqué.
    state.slots.push(id);
    writeSent(state);
    if (ok) break; // un seul rappel par tick
  }
}

let timer: number | null = null;

/** Démarre le planificateur. Idempotent, sûr en SSR. */
export function startDailyNotificationScheduler(): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (timer !== null) return stopDailyNotificationScheduler;

  void tick();
  timer = window.setInterval(() => {
    void tick();
  }, CHECK_INTERVAL_MS);

  return stopDailyNotificationScheduler;
}

export function stopDailyNotificationScheduler(): void {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}
