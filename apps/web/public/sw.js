/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */
// Body Recovery Service Worker
// Provides offline support, caching strategies, and background sync

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `body-recovery-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `body-recovery-dynamic-${CACHE_VERSION}`;
const API_CACHE = `body-recovery-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `body-recovery-images-${CACHE_VERSION}`;
const EXERCISE_CACHE = `body-recovery-exercises-${CACHE_VERSION}`;

// Assets to cache on install (app shell)
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/body',
  '/progress',
  '/history',
  '/settings',
  '/manifest.json',
  '/icons/icon-72x72.svg',
  '/icons/icon-96x96.svg',
  '/icons/icon-128x128.svg',
  '/icons/icon-144x144.svg',
  '/icons/icon-152x152.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-384x384.svg',
  '/icons/icon-512x512.svg',
  '/screenshots/screenshot-wide.svg',
  '/screenshots/screenshot-narrow.svg',
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/',
];

// Exercise library routes - cache these for offline workout support
const EXERCISE_ROUTES = [
  '/api/exercises',
  '/api/workouts',
  '/api/sessions',
];

// Static asset extensions for cache-first strategy
const STATIC_EXTENSIONS = [
  '.js',
  '.css',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

// Image extensions
const IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE = 50;
const MAX_API_CACHE = 30;
const MAX_IMAGE_CACHE = 100;
const MAX_EXERCISE_CACHE = 200;

// ================================
// Install Event
// ================================
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache static assets:', error);
      })
  );
});

// ================================
// Activate Event
// ================================
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('body-recovery-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== API_CACHE &&
                     cacheName !== IMAGE_CACHE &&
                     cacheName !== EXERCISE_CACHE;
            })
            .map((cacheName) => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// ================================
// Fetch Event - Caching Strategies
// ================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Exercise library - Stale While Revalidate for offline workout support
  if (isExerciseRoute(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, EXERCISE_CACHE, MAX_EXERCISE_CACHE));
    return;
  }

  // API calls - Network First
  if (isApiRoute(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE, MAX_API_CACHE));
    return;
  }

  // Images - Cache First with stale-while-revalidate
  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE));
    return;
  }

  // Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation requests - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE, MAX_DYNAMIC_CACHE)
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  // Default - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, MAX_DYNAMIC_CACHE));
});

// ================================
// Caching Strategies
// ================================

/**
 * Network First Strategy
 * Try network, fall back to cache, update cache on success
 */
async function networkFirst(request, cacheName, maxItems) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());

      // Trim cache if needed
      if (maxItems) {
        trimCache(cacheName, maxItems);
      }
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Cache First Strategy
 * Try cache, fall back to network, update cache on network success
 */
async function cacheFirst(request, cacheName, maxItems) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());

      // Trim cache if needed
      if (maxItems) {
        trimCache(cacheName, maxItems);
      }
    }

    return networkResponse;
  } catch (error) {
    // Return offline fallback for images
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());

        if (maxItems) {
          trimCache(cacheName, maxItems);
        }
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// ================================
// Helper Functions
// ================================

function isApiRoute(pathname) {
  return API_ROUTES.some((route) => pathname.startsWith(route));
}

function isExerciseRoute(pathname) {
  return EXERCISE_ROUTES.some((route) => pathname.startsWith(route));
}

function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

function isImage(pathname) {
  return IMAGE_EXTENSIONS.some((ext) => pathname.toLowerCase().endsWith(ext));
}

/**
 * Trim cache to maximum number of items
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Delete oldest items (FIFO)
    const deleteCount = keys.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ================================
// Background Sync
// ================================

// Register for background sync
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync event:', event.tag);

  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }

  if (event.tag === 'sync-pain-logs') {
    event.waitUntil(syncPainLogs());
  }

  if (event.tag === 'sync-check-ins') {
    event.waitUntil(syncCheckIns());
  }

  if (event.tag === 'sync-workout-completions') {
    event.waitUntil(syncWorkoutCompletions());
  }

  if (event.tag === 'sync-exercise-progress') {
    event.waitUntil(syncExerciseProgress());
  }
});

/**
 * Sync pending actions from IndexedDB
 */
async function syncPendingActions() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          // Remove from pending queue
          await removePendingAction(action.id);

          // Notify clients of successful sync
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              action: action.type,
              id: action.id,
            });
          });
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to get pending actions:', error);
  }
}

async function syncPainLogs() {
  return syncPendingActions();
}

async function syncCheckIns() {
  return syncPendingActions();
}

async function syncWorkoutCompletions() {
  try {
    const pendingActions = await getPendingActions();
    const workoutActions = pendingActions.filter(action => action.type === 'workout-completion');

    for (const action of workoutActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await removePendingAction(action.id);

          // Notify clients
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: 'WORKOUT_SYNCED',
              id: action.id,
            });
          });
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync workout:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to sync workout completions:', error);
  }
}

async function syncExerciseProgress() {
  try {
    const pendingActions = await getPendingActions();
    const progressActions = pendingActions.filter(action => action.type === 'exercise-progress');

    for (const action of progressActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await removePendingAction(action.id);

          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: 'PROGRESS_SYNCED',
              id: action.id,
            });
          });
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync exercise progress:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to sync exercise progress:', error);
  }
}

// ================================
// IndexedDB Operations
// ================================

const DB_NAME = 'body-recovery-offline';
const DB_VERSION = 1;
const PENDING_STORE = 'pending-actions';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getPendingActions() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_STORE, 'readonly');
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingAction(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_STORE, 'readwrite');
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ================================
// Push Notifications
// ================================

self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');

  let data = {
    title: 'Body Recovery',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    tag: 'general',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (error) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.notification.tag);

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  // Handle different notification types
  switch (event.notification.tag) {
    case 'workout-reminder':
      targetUrl = '/body';
      break;
    case 'check-in-reminder':
      targetUrl = '/progress';
      break;
    case 'recovery-tip':
      targetUrl = data.url || '/';
      break;
    default:
      targetUrl = data.url || '/';
  }

  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case 'view':
        targetUrl = data.url || '/';
        break;
      case 'dismiss':
        return;
      case 'snooze':
        // Could schedule another notification
        return;
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] Notification closed:', event.notification.tag);

  // Track notification dismissal for analytics
  const data = event.notification.data || {};

  // Could send analytics event here
});

// ================================
// Message Handling
// ================================

self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(DYNAMIC_CACHE)
          .then((cache) => cache.addAll(payload.urls))
      );
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys()
          .then((cacheNames) => {
            return Promise.all(
              cacheNames
                .filter((name) => name.startsWith('body-recovery-'))
                .map((name) => caches.delete(name))
            );
          })
      );
      break;

    case 'GET_CACHE_SIZE':
      event.waitUntil(
        getCacheSize().then((size) => {
          event.source.postMessage({
            type: 'CACHE_SIZE',
            payload: { size },
          });
        })
      );
      break;

    case 'PREFETCH_EXERCISES':
      // Prefetch exercise library for offline use
      event.waitUntil(
        caches.open(EXERCISE_CACHE)
          .then(async (cache) => {
            const urls = payload?.urls || EXERCISE_ROUTES;
            for (const url of urls) {
              try {
                const response = await fetch(url, { cache: 'no-store' });
                if (response.ok) {
                  await cache.put(url, response);
                }
              } catch (error) {
                console.error('[ServiceWorker] Failed to prefetch:', url, error);
              }
            }
          })
      );
      break;

    case 'CACHE_WORKOUT':
      // Cache specific workout data for offline use
      event.waitUntil(
        caches.open(EXERCISE_CACHE)
          .then(async (cache) => {
            if (payload?.url && payload?.data) {
              const response = new Response(JSON.stringify(payload.data), {
                headers: { 'Content-Type': 'application/json' },
              });
              await cache.put(payload.url, response);
            }
          })
      );
      break;

    case 'GET_PENDING_COUNT':
      event.waitUntil(
        getPendingActions().then((actions) => {
          event.source.postMessage({
            type: 'PENDING_COUNT',
            payload: { count: actions.length },
          });
        })
      );
      break;
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

// ================================
// Periodic Background Sync
// ================================

self.addEventListener('periodicsync', (event) => {
  console.log('[ServiceWorker] Periodic sync event:', event.tag);

  if (event.tag === 'update-content') {
    event.waitUntil(updateCachedContent());
  }
});

async function updateCachedContent() {
  try {
    const cache = await caches.open(STATIC_CACHE);

    // Re-fetch and cache critical assets
    for (const url of STATIC_ASSETS) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to update:', url, error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to update cached content:', error);
  }
}

console.log('[ServiceWorker] Service Worker loaded');
