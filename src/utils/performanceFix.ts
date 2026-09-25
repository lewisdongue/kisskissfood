/**
 * PERFORMANCE FIX: Prevent UI Freezing
 * Wraps heavy operations in requestIdleCallback to prevent blocking
 */

// Debounce function to prevent rapid-fire clicks
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

// Throttle function to limit execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Run heavy operations when browser is idle
export function runWhenIdle(callback: () => void, timeout: number = 2000): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}

// Prevent rapid button clicks
export function preventDoubleClick(
  callback: () => void,
  cooldown: number = 1000
): () => void {
  let lastClick = 0;
  
  return () => {
    const now = Date.now();
    if (now - lastClick < cooldown) {
      console.log('⚠️ Button click ignored (too fast)');
      return;
    }
    lastClick = now;
    callback();
  };
}

// Monitor main thread blocking
let isBlocking = false;
let blockingWarned = false;

export function startBlockingMonitor(): void {
  let lastTime = Date.now();
  
  const check = () => {
    const currentTime = Date.now();
    const delta = currentTime - lastTime;
    
    // If more than 100ms passed, main thread was blocked
    if (delta > 100) {
      isBlocking = true;
      if (!blockingWarned) {
        console.warn(`⚠️ Main thread blocked for ${delta}ms`);
        blockingWarned = true;
      }
    } else {
      isBlocking = false;
      blockingWarned = false;
    }
    
    lastTime = currentTime;
    requestAnimationFrame(check);
  };
  
  requestAnimationFrame(check);
}

export function isMainThreadBlocking(): boolean {
  return isBlocking;
}

// Break up long tasks
export async function breakUpLongTask<T>(
  items: T[],
  processItem: (item: T) => void,
  batchSize: number = 10
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    batch.forEach(processItem);
    
    // Yield to browser
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// Defer non-critical work
export function deferWork(callback: () => void): void {
  if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
    (window as any).scheduler.postTask(callback, { priority: 'background' });
  } else {
    runWhenIdle(callback);
  }
}
