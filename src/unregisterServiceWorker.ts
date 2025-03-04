declare global {
  interface Window {
    caches: CacheStorage;
  }
}

export function unregisterServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then(() => {
          console.log('ServiceWorker unregistered successfully');
          // Clear caches
          if ('caches' in window) {
            window.caches.keys().then((cacheNames) => {
              cacheNames.forEach((cacheName) => {
                window.caches.delete(cacheName).then(() => {
                  console.log('Cache deleted:', cacheName);
                });
              });
            });
          }
        });
      });
    });
  }
}
