/**
 * Service Worker для AIST Messenger PWA
 * Обеспечивает офлайн работу и кэширование ресурсов
 */

const CACHE_NAME = 'aist-messenger-v1';
const STATIC_CACHE = 'aist-static-v1';
const DATA_CACHE = 'aist-data-v1';

// Ресурсы для кэширования при установке
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/vite.svg'
];

// API endpoints, которые кэшируем
const API_CACHE_PATTERNS = [
  /\/api\/chats/,
  /\/api\/messages/,
  /\/api\/users/,
  /\/api\/profile/
];

/**
 * Установка Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting(); // Активируем сразу
      })
  );
});

/**
 * Активация Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DATA_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        return self.clients.claim(); // Занимаем все клиенты сразу
      })
  );
});

/**
 * Перехват запросов (Network First для API, Cache First для статики)
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем non-GET запросы и WebSocket
  if (request.method !== 'GET' || url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // API запросы - Network First с fallback на кэш
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Статические ресурсы - Cache First с fallback на сеть
  event.respondWith(handleStaticRequest(request));
});

/**
 * Обработка API запросов (Network First)
 */
async function handleAPIRequest(request) {
  try {
    // Сначала пробуем сеть
    const networkResponse = await fetch(request.clone());
    
    // Кэшируем успешные ответы
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Если сеть недоступна, берем из кэша
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Если нет в кэше, возвращаем офлайн ответ
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Нет соединения с интернетом' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Обработка статических запросов (Cache First)
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Кэшируем только успешные ответы
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static resource failed:', request.url);
    
    // Для навигации возвращаем index.html
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

/**
 * Проверка, является ли запрос API
 */
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Обработка сообщений от клиента
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'SYNC_PENDING':
      syncPendingData().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

/**
 * Очистка всех кэшей
 */
async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

/**
 * Синхронизация отложенных данных
 */
async function syncPendingData() {
  console.log('[SW] Syncing pending data...');
  // Здесь будет логика синхронизации отложенных запросов
  // Используем Background Sync API если доступен
  if (self.registration && self.registration.sync) {
    await self.registration.sync.register('sync-data');
  }
}

/**
 * Background Sync
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

/**
 * Синхронизация данных
 */
async function syncData() {
  console.log('[SW] Background sync triggered');
  // Получаем отложенные данные из IndexedDB и отправляем на сервер
  // Это будет реализовано через syncManager.js
}

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Новое сообщение',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      chatId: data.chatId,
      messageId: data.messageId
    },
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'AIST Messenger', options)
  );
});

/**
 * Обработка клика по уведомлению
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Ищем открытый клиент
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Открываем новый клиент
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
