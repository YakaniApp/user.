
const CACHE_NAME = 'somaluganda-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://aistudiocdn.com/react@^19.2.1',
  'https://aistudiocdn.com/react-dom@^19.2.1/',
  'https://aistudiocdn.com/react@^19.2.1/',
  'https://aistudiocdn.com/@google/genai@^1.30.0',
  'https://aistudiocdn.com/lucide-react@^0.555.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }
      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Fallback for HTML if offline and not cached (though root should be cached)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
