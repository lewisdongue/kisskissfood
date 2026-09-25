import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: (string | Date | { [key: string]: unknown })[]) => void;
    dataLayer?: (string | Date | { [key: string]: unknown })[][];
  }
}


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const SW_FILENAME = "firebase-messaging-sw.js";
    // The service worker cannot read import.meta.env, so the Firebase config
    // travels with the registration URL. No key is hardcoded anywhere.
    const swConfigQuery = new URLSearchParams(
      Object.entries({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }).filter(([, v]) => Boolean(v)) as [string, string][],
    ).toString();
    const SW_URL = swConfigQuery ? `/${SW_FILENAME}?${swConfigQuery}` : `/${SW_FILENAME}`;
    let isRefreshing = false;
    const PAGE_LOAD_TIME = Date.now();
    const AUTO_UPDATE_KEY = "sw-auto-updated";
    const hasAutoUpdated = sessionStorage.getItem(AUTO_UPDATE_KEY) === "true";

    const shouldAutoUpdate = (): boolean => {
      if (Date.now() - PAGE_LOAD_TIME < 10000) return false;
      if (hasAutoUpdated) return false;
      return true;
    };

    const handleLoad = () => {
      navigator.serviceWorker
        .register(SW_URL, { updateViaCache: "none" })
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                if (shouldAutoUpdate()) {
                  sessionStorage.setItem(AUTO_UPDATE_KEY, "true");
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                }
              }
            });
          });

          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!isRefreshing) {
              const pageAge = Date.now() - PAGE_LOAD_TIME;
              if (pageAge > 15000 && sessionStorage.getItem(AUTO_UPDATE_KEY) === "true") {
                isRefreshing = true;
                window.location.reload();
              }
            }
          });

          setTimeout(() => {
            registration.update().catch((err) => {
              console.error("[SW] Update check failed:", err);
            });
          }, 60000);

          setInterval(() => {
            registration.update().catch((err) => {
              console.error("[SW] Periodic update check failed:", err);
            });
          }, 6 * 60 * 60 * 1000);

          setTimeout(() => {
            sessionStorage.removeItem(AUTO_UPDATE_KEY);
          }, 30000);
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });

      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          if (reg.active?.scriptURL?.includes("app-service-worker.js")) {
            reg.unregister();
          }
          if (
            reg.active?.scriptURL?.includes("sw.js") &&
            !reg.active?.scriptURL?.includes("firebase-messaging-sw.js")
          ) {
            reg.unregister();
          }
        }
      });
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.deferredInstallPrompt = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredInstallPrompt = e as BeforeInstallPromptEvent;
      window.dispatchEvent(new CustomEvent("pwa-install-available"));
    };

    const handleAppInstalled = () => {
      window.deferredInstallPrompt = null;
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "pwa_installed", { method: "browser_prompt" });
      }
      window.dispatchEvent(new CustomEvent("pwa-installed"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "pwa_launch", { source: "home_screen" });
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);
}
