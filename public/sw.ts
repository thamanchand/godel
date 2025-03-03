/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
export {};

const CACHE_NAME = 'godelai-route-optimizer-v1';
const OFFLINE_URL = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/src/main.tsx',
  '/src/App.tsx',
  OFFLINE_URL,
  // Static assets that should work offline
  '/icons/icon-152x152.png',
];

// Check if URL scheme is supported for caching
const isValidCacheUrl = (url: string): boolean => {
  const supportedSchemes = ['http:', 'https:'];
  try {
    const urlObj = new URL(url);
    return supportedSchemes.includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Get offline fallback response
const getOfflineFallback = async () => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(OFFLINE_URL);
  return (
    cachedResponse ||
    new Response('You are offline', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  );
};

// Install service worker
self.addEventListener('install', ((event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
}) as EventListener);

// Cache and return requests
self.addEventListener('fetch', ((event: FetchEvent) => {
  // Only handle supported URL schemes
  if (!isValidCacheUrl(event.request.url)) {
    return;
  }

  // Handle navigation requests differently
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to use the preloaded response
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Try to fetch from network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log('Navigation fetch failed:', error);

          // Check cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page as last resort
          return getOfflineFallback();
        }
      })()
    );
    return;
  }

  // Handle non-navigation requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Cache hit
      }

      return fetch(event.request.clone())
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Only cache if URL scheme is supported
          if (isValidCacheUrl(event.request.url)) {
            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).catch((error) => {
                  console.error('Cache put error:', error);
                });
              })
              .catch((error) => {
                console.error('Cache open error:', error);
              });
          }

          return response;
        })
        .catch(async (error) => {
          console.error('Fetch error:', error);

          // For API requests, return a JSON error
          if (event.request.url.includes('/api/')) {
            return new Response(JSON.stringify({ error: 'You are offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // For other requests, try to return cached version
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return basic offline response as last resort
          return new Response('Resource unavailable offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
}) as EventListener);

// Update service worker
self.addEventListener('activate', ((event: ExtendableEvent) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );

  // Claim clients immediately
  event.waitUntil(self.clients.claim());
}) as EventListener);
