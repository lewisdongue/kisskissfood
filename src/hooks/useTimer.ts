import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

// ── External-store call timer ──────────────────────────────────────────────
// The old implementation kept `seconds` in React state, so every tick
// re-rendered the entire call screen (3.8k lines of JSX) once per second and
// starved click handlers → high INP. The timer now lives outside React and
// only the tiny components that subscribe re-render each second.

export type CallTimer = {
    start: () => void;
    stop: () => void;
    reset: () => void;
    getSeconds: () => number;
    subscribe: (fn: () => void) => () => void;
};

export const useTimer = (onMinutePassed?: () => void): CallTimer => {
    const secondsRef = useRef(0);
    const intervalRef = useRef<number | null>(null);
    const lastMinuteRef = useRef(0);
    const listenersRef = useRef(new Set<() => void>());
    const minuteCbRef = useRef(onMinutePassed);
    minuteCbRef.current = onMinutePassed;

    const emit = useCallback(() => {
        listenersRef.current.forEach((fn) => fn());
    }, []);

    const clear = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        if (intervalRef.current !== null) return;
        intervalRef.current = window.setInterval(() => {
            secondsRef.current += 1;
            const currentMinute = Math.floor(secondsRef.current / 60);
            if (currentMinute > lastMinuteRef.current) {
                lastMinuteRef.current = currentMinute;
                minuteCbRef.current?.();
            }
            emit();
        }, 1000);
    }, [emit]);

    const stop = useCallback(() => {
        clear();
        emit();
    }, [clear, emit]);

    const reset = useCallback(() => {
        clear();
        secondsRef.current = 0;
        lastMinuteRef.current = 0;
        emit();
    }, [clear, emit]);

    const getSeconds = useCallback(() => secondsRef.current, []);

    const subscribe = useCallback((fn: () => void) => {
        listenersRef.current.add(fn);
        return () => {
            listenersRef.current.delete(fn);
        };
    }, []);

    useEffect(() => clear, [clear]);

    return useMemo(
        () => ({ start, stop, reset, getSeconds, subscribe }),
        [start, stop, reset, getSeconds, subscribe],
    );
};

/** Subscribe to the live second count from a small, isolated component. */
export const useTimerSeconds = (timer: CallTimer) =>
    useSyncExternalStore(timer.subscribe, timer.getSeconds, () => 0);
