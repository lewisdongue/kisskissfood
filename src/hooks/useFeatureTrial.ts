import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TRIAL_KEY = "caakus_premium_trial_started_at";
export const TRIAL_DURATION_MS = 15 * 60 * 1000;

function readStart(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * 15-minute free trial of premium filters / customization for guests and
 * free accounts. Starts on the first call (or first account use) and ticks
 * down live so we can show a countdown on the buttons.
 */
export type FeatureTrial = {
  trialActive: boolean;
  startTrial: () => void;
  getLabel: () => string | null;
  subscribe: (listener: () => void) => () => void;
};

export function useFeatureTrial(isPremium: boolean): FeatureTrial {
  const initialStart = readStart();
  const [trialActive, setTrialActive] = useState(
    !isPremium && (initialStart === null || Date.now() - initialStart < TRIAL_DURATION_MS),
  );
  const listenersRef = useRef(new Set<() => void>());

  const emit = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const getLabel = useCallback(() => {
    if (isPremium) return null;
    const start = readStart();
    const msLeft = start === null
      ? TRIAL_DURATION_MS
      : Math.max(0, TRIAL_DURATION_MS - (Date.now() - start));
    if (msLeft <= 0) return null;
    const totalSeconds = Math.ceil(msLeft / 1000);
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
  }, [isPremium]);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const startTrial = useCallback(() => {
    if (readStart() !== null) return;
    try {
      localStorage.setItem(TRIAL_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setTrialActive(!isPremium);
    emit();
  }, [emit, isPremium]);

  useEffect(() => {
    if (isPremium) {
      setTrialActive(false);
      return;
    }
    const tick = () => {
      const start = readStart();
      const active = start === null || Date.now() - start < TRIAL_DURATION_MS;
      setTrialActive((current) => current === active ? current : active);
      emit();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [emit, isPremium]);

  return useMemo(
    () => ({ trialActive, startTrial, getLabel, subscribe }),
    [trialActive, startTrial, getLabel, subscribe],
  );
}

export default useFeatureTrial;
