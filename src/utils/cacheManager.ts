/**
 * Cache Manager Utility
 * Handles PWA cache clearing and service worker updates
 */

export class CacheManager {
  /**
   * Clear all PWA caches
   */
  static async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log('[CacheManager] Found caches:', cacheNames);
        
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            console.log('[CacheManager] Deleting cache:', cacheName);
            await caches.delete(cacheName);
          })
        );
        
        console.log('[CacheManager] ✅ All caches cleared');
        return;
      } catch (error) {
        console.error('[CacheManager] ❌ Failed to clear caches:', error);
        throw error;
      }
    } else {
      console.warn('[CacheManager] Cache API not supported');
    }
  }

  /**
   * Send message to service worker to clear cache
   */
  static async clearServiceWorkerCache(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      console.log('[CacheManager] Sent CLEAR_CACHE message to service worker');
    }
  }

  /**
   * Force service worker update
   */
  static async forceUpdate(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        console.log('[CacheManager] ✅ Service worker update triggered');
      } catch (error) {
        console.error('[CacheManager] ❌ Failed to update service worker:', error);
      }
    }
  }

  /**
   * Unregister all service workers (nuclear option)
   */
  static async unregisterAllServiceWorkers(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister())
        );
        console.log('[CacheManager] ✅ All service workers unregistered');
      } catch (error) {
        console.error('[CacheManager] ❌ Failed to unregister service workers:', error);
      }
    }
  }

  /**
   * Complete cache reset: clear caches, update SW, and reload
   */
  static async performHardReset(): Promise<void> {
    console.log('[CacheManager] 🔄 Performing hard reset...');
    
    try {
      // Step 1: Clear all caches
      await this.clearAllCaches();
      
      // Step 2: Clear service worker cache
      await this.clearServiceWorkerCache();
      
      // Step 3: Force SW update
      await this.forceUpdate();
      
      // Step 4: Clear localStorage (optional - be careful!)
      // localStorage.clear();
      
      // Step 5: Clear sessionStorage
      sessionStorage.clear();
      
      console.log('[CacheManager] ✅ Hard reset complete');
      
      // Step 6: Reload the page
      setTimeout(() => {
        console.log('[CacheManager] Reloading page...');
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('[CacheManager] ❌ Hard reset failed:', error);
      throw error;
    }
  }

  /**
   * Get current cache version from service worker
   */
  static async getCacheVersion(): Promise<string | null> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const controller = navigator.serviceWorker.controller;
        if (!controller) {
          resolve(null);
          return;
        }
        
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
        
        // Timeout after 2 seconds
        setTimeout(() => resolve(null), 2000);
      });
    }
    return null;
  }

  /**
   * Check if app is running as PWA
   */
  static isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Setup automatic cache clearing on app focus
   * NOTE: Only checks for updates — does NOT reload/clear caches automatically
   * to prevent reload loops.
   */
  static setupAutoRefresh(): void {
    let lastFocusTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const now = Date.now();
        const timeSinceLastFocus = now - lastFocusTime;
        
        // Log but do NOT force reload or cache clear — SW handles its own lifecycle
        if (timeSinceLastFocus > 5 * 60 * 1000) {
          console.log('[CacheManager] User returned after 5+ minutes');
          // Do NOT call forceUpdate() here — it can trigger controllerchange → reload loop
        }
        
        lastFocusTime = now;
      }
    });
    
    console.log('[CacheManager] ✅ Auto-refresh setup complete');
  }
}

// Auto-setup on import
if (typeof window !== 'undefined') {
  CacheManager.setupAutoRefresh();
}
