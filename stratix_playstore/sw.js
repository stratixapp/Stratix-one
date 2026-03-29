/**
 * Stratix One — Service Worker
 * Version: 3.0.0
 * Strategy: Cache-first for static assets, network-first for Firebase/APIs
 */

const CACHE_NAME = 'stratix-one-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'
];

/* ── Install: pre-cache app shell ── */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(e => console.warn('[SW] Pre-cache failed:', url, e)))
      );
    })
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: smart caching strategy ── */
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // ── Network-only: Firebase & Google Auth APIs ──
  const networkOnly = [
    'firebaseapp.com',
    'googleapis.com/identitytoolkit',
    'securetoken.google.com',
    'firestore.googleapis.com',
    'firebase.googleapis.com',
    'wa.me',
    'api.whatsapp.com'
  ];
  if (networkOnly.some(domain => url.includes(domain))) {
    event.respondWith(fetch(event.request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // ── Cache-first: fonts & static assets ──
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // ── Stale-while-revalidate: app shell (index.html) ──
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkRes => {
        if (networkRes && networkRes.status === 200 && networkRes.type !== 'opaque') {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return networkRes;
      }).catch(() => null);

      // Return cached immediately, update in background
      return cached || fetchPromise || new Response('App is offline. Please reload when connected.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

/* ── Push Notifications ── */
self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, icon } = event.data;
    self.registration.showNotification(title, {
      body,
      tag: tag || 'sx-general',
      icon: icon || './icon-192.png',
      badge: icon || './icon-192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    });
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── Notification Click ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Focus existing window if open
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      // Open new window
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

/* ── Background Sync (future use) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'stratix-sync') {
    // Handled by the app itself when it comes online
    console.log('[SW] Background sync triggered');
  }
});
