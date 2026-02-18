/**
 * Менеджер синхронизации данных между устройствами
 * Обеспечивает:
 * - Отслеживание локальных изменений
 * - Синхронизацию с сервером
 * - Разрешение конфликтов
 * - Работу офлайн с последующей синхронизацией
 */

const SYNC_QUEUE_KEY = 'aist_sync_queue';
const SYNC_STATE_KEY = 'aist_sync_state';
const LAST_SYNC_KEY = 'aist_last_sync';
const DEVICE_ID_KEY = 'aist_device_id';

// Типы синхронизируемых данных
const SYNC_TYPES = {
  MESSAGES: 'messages',
  CHATS: 'chats',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  CONTACTS: 'contacts',
  KEYS: 'keys'
};

// Состояние синхронизации
const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  OFFLINE: 'offline',
  ERROR: 'error'
};

let deviceId = null;
let syncStatus = SYNC_STATUS.IDLE;
let syncQueue = [];
let listeners = [];
let syncInterval = null;
let isOnline = navigator.onLine;

/**
 * Инициализация менеджера синхронизации
 */
export function initSyncManager() {
  console.log('[SyncManager] Initializing...');
  
  // Получаем или создаем ID устройства
  deviceId = getOrCreateDeviceId();
  
  // Загружаем очередь синхронизации
  syncQueue = loadSyncQueue();
  
  // Слушаем изменения онлайн статуса
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Слушаем сообщения от service worker
  window.addEventListener('sw-message', handleServiceWorkerMessage);
  
  // Запускаем периодическую синхронизацию
  startPeriodicSync();
  
  console.log('[SyncManager] Initialized with device ID:', deviceId);
  
  return {
    deviceId,
    status: syncStatus,
    queueLength: syncQueue.length
  };
}

/**
 * Получить или создать ID устройства
 */
function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * Получить ID устройства
 */
export function getDeviceId() {
  return deviceId || getOrCreateDeviceId();
}

/**
 * Получить статус синхронизации
 */
export function getSyncStatus() {
  return syncStatus;
}

/**
 * Добавить операцию в очередь синхронизации
 */
export function queueSyncOperation(type, operation, data) {
  const syncItem = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type,
    operation,
    data,
    timestamp: Date.now(),
    deviceId: getDeviceId(),
    retryCount: 0,
    status: 'pending'
  };
  
  syncQueue.push(syncItem);
  saveSyncQueue();
  
  console.log('[SyncManager] Queued operation:', syncItem);
  
  // Если онлайн, пытаемся синхронизировать сразу
  if (isOnline && syncStatus === SYNC_STATUS.IDLE) {
    processSyncQueue();
  }
  
  return syncItem.id;
}

/**
 * Обработать очередь синхронизации
 */
export async function processSyncQueue() {
  if (syncStatus === SYNC_STATUS.SYNCING || syncQueue.length === 0) {
    return;
  }
  
  syncStatus = SYNC_STATUS.SYNCING;
  notifyListeners({ status: syncStatus });
  
  console.log('[SyncManager] Processing queue, items:', syncQueue.length);
  
  const { apiPost } = await import('./api.js');
  
  while (syncQueue.length > 0 && isOnline) {
    const item = syncQueue[0];
    
    try {
      await processSyncItem(item, apiPost);
      
      // Успешно обработано - удаляем из очереди
      syncQueue.shift();
      saveSyncQueue();
      
      console.log('[SyncManager] Processed item:', item.id);
    } catch (error) {
      console.error('[SyncManager] Error processing item:', item.id, error);
      
      // Увеличиваем счетчик попыток
      item.retryCount++;
      
      // Если слишком много попыток, пропускаем
      if (item.retryCount >= 5) {
        console.error('[SyncManager] Max retries reached for item:', item.id);
        item.status = 'failed';
        syncQueue.shift();
        saveSyncQueue();
        notifyListeners({ error: item });
      } else {
        // Ждем перед следующей попыткой
        await delay(1000 * item.retryCount);
      }
    }
  }
  
  syncStatus = isOnline ? SYNC_STATUS.IDLE : SYNC_STATUS.OFFLINE;
  notifyListeners({ status: syncStatus });
  
  // Обновляем время последней синхронизации
  if (isOnline) {
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  }
}

/**
 * Обработать один элемент очереди
 */
async function processSyncItem(item, apiPost) {
  switch (item.type) {
    case SYNC_TYPES.MESSAGES:
      await syncMessage(item, apiPost);
      break;
      
    case SYNC_TYPES.CHATS:
      await syncChat(item, apiPost);
      break;
      
    case SYNC_TYPES.PROFILE:
      await syncProfile(item, apiPost);
      break;
      
    case SYNC_TYPES.SETTINGS:
      await syncSettings(item, apiPost);
      break;
      
    case SYNC_TYPES.CONTACTS:
      await syncContacts(item, apiPost);
      break;
      
    case SYNC_TYPES.KEYS:
      await syncKeys(item, apiPost);
      break;
      
    default:
      console.warn('[SyncManager] Unknown sync type:', item.type);
  }
}

/**
 * Синхронизировать сообщение
 */
async function syncMessage(item, apiPost) {
  const { operation, data } = item;
  
  switch (operation) {
    case 'send':
      await apiPost('/api/messages', data);
      break;
      
    case 'edit':
      await apiPost(`/api/messages/${data.messageId}/edit`, data);
      break;
      
    case 'delete':
      await apiPost(`/api/messages/${data.messageId}/delete`, data);
      break;
      
    case 'read':
      await apiPost(`/api/chats/${data.chatId}/read`, data);
      break;
  }
}

/**
 * Синхронизировать чат
 */
async function syncChat(item, apiPost) {
  const { operation, data } = item;
  
  switch (operation) {
    case 'create':
      await apiPost('/api/chats', data);
      break;
      
    case 'update':
      await apiPost(`/api/chats/${data.chatId}`, data);
      break;
      
    case 'delete':
      await apiPost(`/api/chats/${data.chatId}/delete`, data);
      break;
      
    case 'add_member':
      await apiPost(`/api/chats/${data.chatId}/members`, data);
      break;
      
    case 'remove_member':
      await apiPost(`/api/chats/${data.chatId}/members/${data.userId}/delete`, data);
      break;
      
    case 'update_role':
      await apiPost(`/api/chats/${data.chatId}/members/${data.userId}/role`, data);
      break;
  }
}

/**
 * Синхронизировать профиль
 */
async function syncProfile(item, apiPost) {
  const { operation, data } = item;
  
  switch (operation) {
    case 'update':
      await apiPost('/api/profile', data);
      break;
      
    case 'update_avatar':
      await apiPost('/api/profile/avatar', data);
      break;
  }
}

/**
 * Синхронизировать настройки
 */
async function syncSettings(item, apiPost) {
  const { operation, data } = item;
  
  switch (operation) {
    case 'update':
      await apiPost('/api/settings', data);
      break;
  }
}

/**
 * Синхронизировать контакты
 */
async function syncContacts(item, apiPost) {
  const { operation, data } = item;
  
  switch (operation) {
    case 'add':
      await apiPost('/api/contacts', data);
      break;
      
    case 'remove':
      await apiPost(`/api/contacts/${data.userId}/delete`, data);
      break;
  }
}

/**
 * Синхронизировать ключи шифрования
 */
async function syncKeys(item, apiPost) {
  const { operation, data } = item;
  
  switch (operation) {
    case 'upload':
      await apiPost('/api/keys/upload', data);
      break;
      
    case 'download':
      // Это операция получения, не отправки
      break;
  }
}

/**
 * Получить изменения с сервера
 */
export async function fetchServerChanges(lastSyncTime) {
  if (!isOnline) {
    return null;
  }
  
  try {
    const { apiGet } = await import('./api.js');
    const timestamp = lastSyncTime || getLastSyncTime();
    
    const changes = await apiGet(`/api/sync/changes?since=${timestamp}&deviceId=${getDeviceId()}`);
    
    console.log('[SyncManager] Fetched changes from server:', changes);
    
    return changes;
  } catch (error) {
    console.error('[SyncManager] Error fetching changes:', error);
    return null;
  }
}

/**
 * Применить изменения с сервера
 */
export async function applyServerChanges(changes) {
  if (!changes) {
    return;
  }
  
  const { appendMessage, saveMessages } = await import('./chatStorage.js');
  const { addOrUpdateChat, createChat, deleteChat } = await import('./chatStorage.js');
  
  // Применяем изменения сообщений
  if (changes.messages && changes.messages.length > 0) {
    for (const msg of changes.messages) {
      if (msg.deleted) {
        // Удаляем сообщение (будет реализовано)
        console.log('[SyncManager] Message deleted:', msg.id);
      } else {
        // Добавляем или обновляем сообщение
        await appendMessage(msg.chatId, msg);
      }
    }
  }
  
  // Применяем изменения чатов
  if (changes.chats && changes.chats.length > 0) {
    for (const chat of changes.chats) {
      if (chat.deleted) {
        deleteChat(chat.id);
      } else {
        addOrUpdateChat(chat);
      }
    }
  }
  
  // Применяем изменения профиля
  if (changes.profile) {
    localStorage.setItem('aist_user', JSON.stringify(changes.profile));
    notifyListeners({ profile: changes.profile });
  }
  
  // Применяем изменения настроек
  if (changes.settings) {
    localStorage.setItem('aist_settings', JSON.stringify(changes.settings));
    notifyListeners({ settings: changes.settings });
  }
  
  console.log('[SyncManager] Applied server changes');
}

/**
 * Полная синхронизация
 */
export async function fullSync() {
  if (!isOnline) {
    console.log('[SyncManager] Offline, skipping full sync');
    return;
  }
  
  syncStatus = SYNC_STATUS.SYNCING;
  notifyListeners({ status: syncStatus });
  
  try {
    // 1. Сначала отправляем локальные изменения
    await processSyncQueue();
    
    // 2. Получаем изменения с сервера
    const changes = await fetchServerChanges();
    
    // 3. Применяем изменения с сервера
    await applyServerChanges(changes);
    
    console.log('[SyncManager] Full sync completed');
  } catch (error) {
    console.error('[SyncManager] Full sync error:', error);
    syncStatus = SYNC_STATUS.ERROR;
  } finally {
    syncStatus = SYNC_STATUS.IDLE;
    notifyListeners({ status: syncStatus });
  }
}

/**
 * Загрузить очередь синхронизации
 */
function loadSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Сохранить очередь синхронизации
 */
function saveSyncQueue() {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
  } catch (error) {
    console.error('[SyncManager] Error saving queue:', error);
  }
}

/**
 * Получить время последней синхронизации
 */
function getLastSyncTime() {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Запустить периодическую синхронизацию
 */
function startPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Синхронизируем каждые 30 секунд
  syncInterval = setInterval(() => {
    if (isOnline && syncStatus === SYNC_STATUS.IDLE) {
      fullSync();
    }
  }, 30000);
}

/**
 * Остановить периодическую синхронизацию
 */
export function stopPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Обработчик перехода в онлайн
 */
function handleOnline() {
  console.log('[SyncManager] Online');
  isOnline = true;
  syncStatus = SYNC_STATUS.IDLE;
  
  // Синхронизируем при восстановлении соединения
  setTimeout(() => {
    fullSync();
  }, 1000);
  
  notifyListeners({ online: true, status: syncStatus });
}

/**
 * Обработчик перехода в офлайн
 */
function handleOffline() {
  console.log('[SyncManager] Offline');
  isOnline = false;
  syncStatus = SYNC_STATUS.OFFLINE;
  notifyListeners({ online: false, status: syncStatus });
}

/**
 * Обработчик сообщений от service worker
 */
function handleServiceWorkerMessage(event) {
  const { detail } = event;
  console.log('[SyncManager] Message from SW:', detail);
  
  if (detail.type === 'sync-completed') {
    // Синхронизация завершена в фоне
    fullSync();
  }
}

/**
 * Добавить слушателя событий синхронизации
 */
export function addSyncListener(listener) {
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }
}

/**
 * Удалить слушателя событий синхронизации
 */
export function removeSyncListener(listener) {
  listeners = listeners.filter(l => l !== listener);
}

/**
 * Уведомить слушателей
 */
function notifyListeners(data) {
  listeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error('[SyncManager] Error in listener:', error);
    }
  });
}

/**
 * Задержка
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Очистить очередь синхронизации
 */
export function clearSyncQueue() {
  syncQueue = [];
  saveSyncQueue();
  console.log('[SyncManager] Queue cleared');
}

/**
 * Получить статистику синхронизации
 */
export function getSyncStats() {
  return {
    deviceId: getDeviceId(),
    status: syncStatus,
    queueLength: syncQueue.length,
    lastSync: getLastSyncTime(),
    isOnline
  };
}

// Экспорт констант
export { SYNC_TYPES, SYNC_STATUS };
