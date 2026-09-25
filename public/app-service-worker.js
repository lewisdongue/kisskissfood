/**
 * SERVICE WORKER FOR MOBILE PWA
 * Network-first strategy to prevent stale cache issues
 */

const CACHE_VERSION = 'v4.0.2';
const CACHE_NAMES = {
  STATIC: `caakus-static-${CACHE_VERSION}`,
  DYNAMIC: `caakus-dynamic-${CACHE_VERSION}`,
  IMAGES: `caakus-images-${CACHE_VERSION}`,
  API: `caakus-api-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/logo_128.png',
];

// Install event - cache static assets and activate immediately. This ensures
// users cannot remain pinned to a bundle containing obsolete backend config.
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache only truly static assets (NOT index.html - always fetch fresh)
      caches.open(CACHE_NAMES.STATIC).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Static cache failed:', err);
        });
      }),
    ]).then(() => {
      console.log('[SW] Installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - AGGRESSIVELY clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ANY cache that doesn't match current version
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activated, claiming clients');
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Strategy 1: Network First for API calls (always fresh data)
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase') ||
      url.pathname.includes('/rpc/')) {
    event.respondWith(networkFirst(request, CACHE_NAMES.API));
    return;
  }
  
  // Strategy 2: Cache First for Agora SDK (critical, rarely changes)
  if (url.href.includes('agora.io') || url.href.includes('AgoraRTC')) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.AGORA));
    return;
  }
  
  // Strategy 3: Cache First for images (performance)
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, CACHE_NAMES.IMAGES));
    return;
  }
  
  // Strategy 4: NETWORK FIRST for JS/CSS (prevent stale code)
  if (request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(networkFirst(request, CACHE_NAMES.STATIC));
    return;
  }
  
  // Strategy 5: Cache first for fonts (rarely change)
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, CACHE_NAMES.STATIC));
    return;
  }
  
  // Strategy 6: ALWAYS network for HTML (critical for SPA routing)
  if (request.destination === 'document' || 
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkOnlyWithFallback(request));
    return;
  }
  
  // Default: Network First with cache fallback
  event.respondWith(networkFirst(request, CACHE_NAMES.DYNAMIC));
});

// CACHING STRATEGIES

// Network Only with offline fallback for HTML
async function networkOnlyWithFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Only fallback to cache if truly offline
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return a simple offline page
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body style="font-family:system-ui;text-align:center;padding:50px;"><h1>You are offline</h1><p>Please check your internet connection.</p><button onclick="location.reload()">Retry</button></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 503 }
    );
  }
}

// Cache First - instant load, update in background
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached immediately
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Cache First fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - fresh data, fallback to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    console.error('Network First fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - instant cached response + background update
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached immediately if available
  return cached || fetchPromise || new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // Sync any pending actions when back online
  console.log('📤 Syncing offline actions...');
  
  // TODO: Implement offline action queue
  
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'New notification',
    icon: '/logo.png',
    badge: '/logo_128.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Caakus', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Message handler for clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches');
    event.waitUntil(
      caches.keys().then((names) => {
        console.log('[SW] Deleting caches:', names);
        return Promise.all(names.map((name) => caches.delete(name)));
      }).then(() => {
        console.log('[SW] All caches cleared');
        // Notify client that cache is cleared
        if (event.source) {
          event.source.postMessage({ type: 'CACHE_CLEARED' });
        }
      })
    );
  }
  
  if (event.data?.type === 'GET_VERSION') {
    if (event.source) {
      event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
    }
  }
});
