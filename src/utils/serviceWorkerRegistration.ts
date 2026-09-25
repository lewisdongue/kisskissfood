/**
 * SERVICE WORKER REGISTRATION
 * Mobile PWA optimization with update handling
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker not supported');
    return null;
  }
  
  try {
    // Register app service worker
    const registration = await navigator.serviceWorker.register('/app-service-worker.js', {
      scope: '/',
      updateViaCache: 'none', // Always check for updates
    });
    
    console.log('✅ Service Worker registered:', registration.scope);
    
    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('🔄 New version available');
          
          // Show update notification
          if (confirm('A new version of Caakus is available. Update now?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });
    
    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker updated');
      window.location.reload();
    });
    
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      await registration.unregister();
      console.log('✅ Service Worker unregistered');
    }
  } catch (error) {
    console.error('❌ Service Worker unregistration failed:', error);
  }
}

export async function clearServiceWorkerCache() {
  if (!('caches' in window)) return;
  
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    console.log('✅ Cache cleared');
  } catch (error) {
    console.error('❌ Cache clear failed:', error);
  }
}

// Check if app is running as PWA
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

// Prompt user to install PWA
export function promptPWAInstall() {
  let deferredPrompt: any = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'block';
      
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`PWA install ${outcome}`);
        
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed');
    deferredPrompt = null;
  });
}

// Sync offline actions when back online
export async function syncOfflineActions() {
  if (!('serviceWorker' in navigator) || !('sync' in navigator.serviceWorker)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-offline-actions');
    console.log('📤 Background sync registered');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}
