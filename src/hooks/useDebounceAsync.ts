/**
 * CRITICAL FIX: Wrap AudioCall's findAndConnect with debouncing
 * Prevents UI freezing when clicking "Tap to Start"
 */

import { useCallback, useRef } from 'react';

export function useDebounceAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunc: T,
  delay: number = 500
): (...args: Parameters<T>) => Promise<void> {
  const isExecuting = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    async (...args: Parameters<T>) => {
      // Prevent rapid-fire clicks
      if (isExecuting.current) {
        console.log('⚠️ Function already executing, ignoring click');
        return;
      }

      // Clear any pending timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      // Debounce
      return new Promise((resolve) => {
        timeoutRef.current = window.setTimeout(async () => {
          isExecuting.current = true;
          try {
            await asyncFunc(...args);
            resolve();
          } catch (error) {
            console.error('Async function error:', error);
            resolve();
          } finally {
            // Allow next execution after a cooldown
            window.setTimeout(() => {
              isExecuting.current = false;
            }, 1000);
          }
        }, delay);
      });
    },
    [asyncFunc, delay]
  );
}

// Hook to prevent button spam
export function useButtonCooldown(initialDelay: number = 1000) {
  const lastClick = useRef(0);
  const isOnCooldown = useRef(false);

  const canClick = useCallback(() => {
    const now = Date.now();
    if (isOnCooldown.current || now - lastClick.current < initialDelay) {
      console.log('⚠️ Button on cooldown');
      return false;
    }
    return true;
  }, [initialDelay]);

  const recordClick = useCallback(() => {
    lastClick.current = Date.now();
    isOnCooldown.current = true;
    
    window.setTimeout(() => {
      isOnCooldown.current = false;
    }, initialDelay);
  }, [initialDelay]);

  return { canClick, recordClick };
}
