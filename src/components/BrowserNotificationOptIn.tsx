import { useEffect } from "react";
import NotificationService from "../services/notificationService";
import { useAuth } from "../hooks/useAuth";

const ASKED_KEY = "caakus_notif_asked_at";
const RETRY_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Enables web push for regular browser visitors (not only installed PWA users).
 * Asks once per day, after a real user interaction, so browsers accept it.
 */
export function BrowserNotificationOptIn() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") {
      if (Notification.permission === "granted") {
        void NotificationService.requestPermission().then((token) => {
          const id = user && !("isGuest" in user) ? user.id : null;
          if (token && id) void NotificationService.saveFCMToken(id, token);
        });
      }
      return;
    }

    let asked = 0;
    try {
      asked = parseInt(localStorage.getItem(ASKED_KEY) || "0", 10) || 0;
    } catch {
      /* ignore */
    }
    if (Date.now() - asked < RETRY_AFTER_MS) return;

    let timer: number | undefined;
    const onInteract = () => {
      timer = window.setTimeout(async () => {
        try {
          localStorage.setItem(ASKED_KEY, Date.now().toString());
        } catch {
          /* ignore */
        }
        const token = await NotificationService.requestPermission();
        const id = user && !("isGuest" in user) ? user.id : null;
        if (token && id) await NotificationService.saveFCMToken(id, token);
      }, 8000);
    };

    window.addEventListener("pointerdown", onInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      if (timer) window.clearTimeout(timer);
    };
  }, [user]);

  return null;
}

export default BrowserNotificationOptIn;
