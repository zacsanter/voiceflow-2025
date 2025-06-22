// Service Worker for aggressive caching of Webflow assets
// Optimized for fast repeat visits

const CACHE_NAME = 'voiceflow-v1.0.0';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/dist/hero-critical.iife.js',
  '/dist/app.iife.js',
  'https://unpkg.com/gsap@3.12.2/dist/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/splide/4.1.4/js/splide.min.js'
];

// Assets to cache on first visit
const WEBFLOW_ASSETS = [
  // Webflow will add these patterns
  /.*\.webflow\.css$/,
  /.*\.webflow\.js$/,
  /.*webflow.*\.js$/,
  /.*webflow.*\.css$/
];

// Install event - cache critical assets immediately
self.addEventListener('install', event => {
  console.info('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.info('[ServiceWorker] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.info('[ServiceWorker] Critical assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Failed to cache critical assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.info('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.info('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.info('[ServiceWorker] Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;
  
  // Check if this is a cacheable asset
  const isCriticalAsset = CRITICAL_ASSETS.some(asset => 
    request.url.includes(asset) || request.url.endsWith(asset)
  );
  
  const isWebflowAsset = WEBFLOW_ASSETS.some(pattern => 
    pattern.test ? pattern.test(request.url) : request.url.includes(pattern)
  );
  
  const isJSAsset = request.url.endsWith('.js');
  const isCSSAsset = request.url.endsWith('.css');
  const isImageAsset = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(request.url);
  
  if (isCriticalAsset || isWebflowAsset || isJSAsset || isCSSAsset || isImageAsset) {
    event.respondWith(handleCacheableRequest(request));
  }
});

// Handle cacheable requests with cache-first strategy
async function handleCacheableRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
      const isExpired = Date.now() - cacheDate.getTime() > CACHE_DURATION;
      
      if (!isExpired) {
        console.info('[ServiceWorker] Serving from cache:', request.url);
        return cachedResponse;
      } else {
        console.info('[ServiceWorker] Cache expired, fetching fresh:', request.url);
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response for caching
      const responseToCache = networkResponse.clone();
      
      // Add timestamp header
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, modifiedResponse);
      
      console.info('[ServiceWorker] Cached fresh response:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    
    // Try to serve stale cache as fallback
    const staleResponse = await caches.match(request);
    if (staleResponse) {
      console.info('[ServiceWorker] Serving stale cache as fallback:', request.url);
      return staleResponse;
    }
    
    // If all else fails, return a basic error response
    return new Response('Network error and no cache available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle skip waiting message from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.info('[ServiceWorker] Received skip waiting message');
    self.skipWaiting();
  }
});

// Background sync for cache updates (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'cache-update') {
      console.info('[ServiceWorker] Background sync: updating cache');
      event.waitUntil(updateCacheInBackground());
    }
  });
}

// Update cache in background
async function updateCacheInBackground() {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Update critical assets
    for (const asset of CRITICAL_ASSETS) {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
          console.info('[ServiceWorker] Background updated:', asset);
        }
      } catch (error) {
        console.warn('[ServiceWorker] Failed to background update:', asset, error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background cache update failed:', error);
  }
}