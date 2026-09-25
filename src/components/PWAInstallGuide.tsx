import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

// BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

type DeviceType = 'ios' | 'android' | 'desktop';
type IOSBrowser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'unknown';

/**
 * Detect exact browser on iOS (all renderers are WebKit, but menus differ)
 */
function detectIOSBrowser(): IOSBrowser {
  const ua = navigator.userAgent.toLowerCase();
  if (!/iphone|ipad|ipod/.test(ua)) return 'unknown';
  if (ua.includes('fxios')) return 'firefox';
  if (ua.includes('edgios')) return 'edge';
  if (ua.includes('crios')) return 'chrome';
  if (ua.includes('safari')) return 'safari';
  return 'unknown'; // default to Safari instructions if we can't tell
}

/**
 * Detect if running in standalone mode (already installed as PWA)
 */
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function PWAInstallGuide() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isInstalled, setIsInstalled] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isInSafari, setIsInSafari] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    // Already installed — hide everything
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setDeviceType('ios');
      setIsIOSDevice(true);
      setIsInSafari(detectIOSBrowser() === 'safari');
    } else if (isAndroid) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Check if user dismissed it before (with a 7-day expiry)
    const dismissedAt = localStorage.getItem('pwa-guide-dismissed-at');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        // Still within dismiss period
        return;
      }
      // Clear old dismiss
      localStorage.removeItem('pwa-guide-dismissed-at');
    }

    // Check if there's already a deferred prompt from main.tsx
    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt as BeforeInstallPromptEvent);
      setCanNativeInstall(true);
    }

    // Listen for the beforeinstallprompt event (from main.tsx dispatch or late arrival)
    const handleInstallAvailable = () => {
      if (window.deferredInstallPrompt) {
        setInstallPrompt(window.deferredInstallPrompt as BeforeInstallPromptEvent);
        setCanNativeInstall(true);
      }
    };

    // Listen for actual beforeinstallprompt (in case it fires after component mounts)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredInstallPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      setCanNativeInstall(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setCanNativeInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('appinstalled', handleInstalled);

    // Show the guide for 8 seconds, then again every hour.
    const LAST_SHOWN_KEY = 'pwa-guide-last-shown-at';
    const HOUR = 60 * 60 * 1000;
    let autoHide: number | undefined;
    let hourly: number | undefined;

    const showForEightSeconds = () => {
      if (isStandalone()) return;
      try {
        localStorage.setItem(LAST_SHOWN_KEY, Date.now().toString());
      } catch {
        /* ignore */
      }
      setShowSteps(false);
      setIsVisible(true);
      if (autoHide) window.clearTimeout(autoHide);
      autoHide = window.setTimeout(() => setIsVisible(false), 8000);
    };

    const lastShownRaw = (() => {
      try {
        return localStorage.getItem(LAST_SHOWN_KEY);
      } catch {
        return null;
      }
    })();
    const lastShown = lastShownRaw ? parseInt(lastShownRaw, 10) : 0;
    if (!lastShown || Date.now() - lastShown >= HOUR) {
      showForEightSeconds();
    }
    hourly = window.setInterval(showForEightSeconds, HOUR);

    // Re-sync canNativeInstall from window (beforeinstallprompt can fire a few seconds after load)
    const syncPrompt = () => {
      if (window.deferredInstallPrompt) {
        setInstallPrompt(window.deferredInstallPrompt as BeforeInstallPromptEvent);
        setCanNativeInstall(true);
      }
    };
    const t1 = window.setTimeout(syncPrompt, 1500);
    const t2 = window.setTimeout(syncPrompt, 4000);

    return () => {
      if (autoHide) window.clearTimeout(autoHide);
      if (hourly) window.clearInterval(hourly);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-guide-dismissed-at', Date.now().toString());
  };

  const scrollToInstallSection = useCallback(() => {
    setShowSteps((v) => !v);
  }, []);

  // Try native install (Android/Desktop): use prompt from state or window so one click opens browser install dialog
  const handleNativeInstall = useCallback(async () => {
    const prompt = installPrompt || (window.deferredInstallPrompt as BeforeInstallPromptEvent | null);
    if (!prompt) return;

    setIsInstalling(true);
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setCanNativeInstall(false);
        setInstallPrompt(null);
        if (typeof window !== 'undefined') window.deferredInstallPrompt = null;
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt]);

  // One click: try native install first (works on Android/Desktop when browser offers it), else scroll to steps (iOS or not yet installable)
  const handleInstallCta = useCallback(async () => {
    const prompt = installPrompt || (typeof window !== 'undefined' ? (window.deferredInstallPrompt as BeforeInstallPromptEvent | null) : null);
    if (prompt) {
      setIsInstalling(true);
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === 'accepted') {
          setIsInstalled(true);
          setCanNativeInstall(false);
          setInstallPrompt(null);
          if (typeof window !== 'undefined') window.deferredInstallPrompt = null;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      scrollToInstallSection();
    }
  }, [installPrompt, scrollToInstallSection]);

  // Don't show if already installed or dismissed
  if (isInstalled || !isVisible) {
    return null;
  }

  const hint =
    deviceType === 'ios'
      ? isInSafari
        ? 'Partager  →  Sur l’écran d’accueil'
        : 'Ouvrir dans Safari  →  Partager  →  Sur l’écran d’accueil'
      : deviceType === 'android'
        ? 'Menu ⋮  →  Installer l’application'
        : 'Barre d’adresse  →  Installer';

  const steps =
    deviceType === 'ios'
      ? isInSafari
        ? ['Touchez l’icône Partager', 'Choisissez « Sur l’écran d’accueil »', 'Validez avec « Ajouter »']
        : ['Ouvrez ce lien dans Safari', 'Touchez l’icône Partager', 'Choisissez « Sur l’écran d’accueil »']
      : deviceType === 'android'
        ? ['Ouvrez le menu ⋮ du navigateur', 'Touchez « Installer l’application »', 'Confirmez « Installer »']
        : ['Cliquez sur l’icône d’installation dans la barre d’adresse', 'Confirmez « Installer »'];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-auto w-full max-w-md max-h-[33vh] overflow-hidden rounded-[22px] border border-white/10 bg-[#07070a]/85 backdrop-blur-2xl shadow-[0_24px_60px_-30px_rgba(0,0,0,1)]"
        role="dialog"
        aria-label={t('pwaInstall.installApp')}
      >
        <div className="flex items-center gap-3 p-3">
          <img
            src="/logo.webp"
            alt=""
            aria-hidden
            className="h-10 w-10 shrink-0 rounded-xl object-contain"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight text-white/95">
              Installer Caakus
            </p>
            <p className="truncate text-[11px] leading-tight text-white/45">{hint}</p>
          </div>

          <button
            type="button"
            onClick={() => void handleInstallCta()}
            disabled={isInstalling}
            className="shrink-0 rounded-full bg-[#7c5cff] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_24px_-6px_rgba(124,92,255,0.9)] transition-transform duration-200 active:scale-95 disabled:opacity-60"
          >
            {isInstalling ? '…' : 'Installer'}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t('pwaInstall.ariaDismiss')}
            className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:text-white/80"
          >
            <X size={16} />
          </button>
        </div>

        {(
          <ol className="border-t border-white/10 px-4 pb-3 pt-2 space-y-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] leading-snug text-white/70">
                <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/80">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

