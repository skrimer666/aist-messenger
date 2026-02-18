/**
 * WebSocket для получения сообщений в реальном времени
 * Улучшенная версия с более надёжной обработкой соединения
 * Поддержка синхронизации между устройствами
 */
import { getWsUrl } from './api';

let ws = null;
let listeners = [];
let reconnectTimer = null;
let heartbeatTimer = null;
let isConnected = false;
let isConnecting = false;
let pendingMessages = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000; // 3 секунды

// Идентификатор устройства для синхронизации
let deviceId = null;

/**
 * Подключиться к WebSocket
 */
export function connectChatWebSocket(token, onMessage) {
  if (ws && isConnected) {
    // Если уже подключены, добавляем слушателя
    if (onMessage && !listeners.includes(onMessage)) {
      listeners.push(onMessage);
    }
    return;
  }

  if (isConnecting) {
    // Уже пытаемся подключиться
    if (onMessage && !listeners.includes(onMessage)) {
      listeners.push(onMessage);
    }
    return;
  }

  isConnecting = true;
  
  // Получаем ID устройства для синхронизации
  deviceId = localStorage.getItem('aist_device_id');
  
  const url = deviceId 
    ? `${getWsUrl()}?token=${encodeURIComponent(token)}&deviceId=${encodeURIComponent(deviceId)}`
    : `${getWsUrl()}?token=${encodeURIComponent(token)}`;

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[ChatWS] Connected');
      isConnected = true;
      isConnecting = false;
      reconnectAttempts = 0;

      // Запускаем heartbeat для поддержания соединения
      startHeartbeat();

      // Отправляем отложенные сообщения
      while (pendingMessages.length > 0) {
        const msg = pendingMessages.shift();
        ws.send(JSON.stringify(msg));
      }

      // Оповещаем слушателей о подключении
      listeners.forEach(listener => {
        try {
          listener({ type: 'connected' });
        } catch (e) {
          console.error('[ChatWS] Error in listener:', e);
        }
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[ChatWS] Received:', data);

        // Обработка heartbeat
        if (data.type === 'pong') {
          return;
        }

        // Обработка сообщений синхронизации
        if (data.type === 'sync') {
          handleSyncMessage(data);
          return;
        }

        // Оповещаем всех слушателей
        listeners.forEach(listener => {
          try {
            listener(data);
          } catch (e) {
            console.error('[ChatWS] Error in listener:', e);
          }
        });
      } catch (e) {
        console.error('[ChatWS] Error parsing message:', e);
      }
    };

    ws.onclose = (event) => {
      console.log('[ChatWS] Disconnected, code:', event.code, 'reason:', event.reason);
      isConnected = false;
      isConnecting = false;
      ws = null;
      stopHeartbeat();

      // Оповещаем слушателей о отключении
      listeners.forEach(listener => {
        try {
          listener({ type: 'disconnected' });
        } catch (e) {
          console.error('[ChatWS] Error in listener:', e);
        }
      });

      // Автоматическое переподключение
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 5); // Экспоненциальная задержка
        console.log(`[ChatWS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        reconnectTimer = setTimeout(() => {
          const newToken = localStorage.getItem('aist_token');
          if (newToken) {
            connectChatWebSocket(newToken);
          }
        }, delay);
      } else {
        console.error('[ChatWS] Max reconnect attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('[ChatWS] Error:', error);
    };

    if (onMessage) listeners.push(onMessage);
  } catch (e) {
    console.error('[ChatWS] Connection error:', e);
    isConnecting = false;
  }
}

/**
 * Запустить heartbeat (периодические ping-сообщения)
 */
function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && isConnected) {
      try {
        ws.send(JSON.stringify({ type: 'ping' }));
      } catch (e) {
        console.error('[ChatWS] Heartbeat error:', e);
      }
    }
  }, 30000); // Каждые 30 секунд
}

/**
 * Остановить heartbeat
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * Отправить сообщение через WebSocket
 */
export function send(data) {
  if (ws && isConnected) {
    try {
      ws.send(JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[ChatWS] Send error:', e);
      pendingMessages.push(data);
      return false;
    }
  } else {
    pendingMessages.push(data);
    return false;
  }
}

/**
 * Добавить слушателя сообщений
 */
export function addListener(listener) {
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }
}

/**
 * Удалить слушателя сообщений
 */
export function removeListener(listener) {
  listeners = listeners.filter(l => l !== listener);
}

/**
 * Отключиться от WebSocket
 */
export function disconnect() {
  stopHeartbeat();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    try {
      ws.close();
    } catch (e) {
      console.error('[ChatWS] Close error:', e);
    }
    ws = null;
  }
  listeners = [];
  isConnected = false;
  isConnecting = false;
  pendingMessages = [];
  reconnectAttempts = 0;
}

/**
 * Проверить, подключен ли WebSocket
 */
export function isWebSocketConnected() {
  return isConnected;
}

/**
 * Проверить, идёт ли подключение
 */
export function isWebSocketConnecting() {
  return isConnecting;
}

/**
 * Получить количество попыток переподключения
 */
export function getReconnectAttempts() {
  return reconnectAttempts;
}

/**
 * Обработка сообщений синхронизации с других устройств
 */
async function handleSyncMessage(data) {
  console.log('[ChatWS] Handling sync message:', data);
  
  const { syncType, payload } = data;
  
  try {
    switch (syncType) {
      case 'message':
        await handleSyncMessage(payload);
        break;
        
      case 'messages_read':
        await handleMessagesRead(payload);
        break;
        
      case 'chat_updated':
        await handleChatUpdated(payload);
        break;
        
      case 'member_added':
      case 'member_removed':
      case 'member_role_changed':
        await handleMemberChanged(payload);
        break;
        
      case 'typing':
        // Обработка индикатора набора текста
        break;
        
      default:
        console.warn('[ChatWS] Unknown sync type:', syncType);
    }
  } catch (error) {
    console.error('[ChatWS] Error handling sync message:', error);
  }
}

/**
 * Обработка синхронизированного сообщения
 */
async function handleSyncMessage(payload) {
  const { appendMessage } = await import('./chatStorage.js');
  await appendMessage(payload.chatId, payload);
  
  // Уведомляем слушателей о новом сообщении
  listeners.forEach(listener => {
    try {
      listener({ type: 'message', ...payload });
    } catch (e) {
      console.error('[ChatWS] Error in listener:', e);
    }
  });
}

/**
 * Обработка синхронизации прочитанных сообщений
 */
async function handleMessagesRead(payload) {
  const { chatId, userId, lastReadId } = payload;
  
  // Обновляем локальное хранилище
  const messages = await (await import('./chatStorage.js')).getMessages(chatId);
  const updatedMessages = messages.map(msg => {
    if (msg.senderId === userId && msg.id <= lastReadId) {
      return { ...msg, read: true };
    }
    return msg;
  });
  
  await (await import('./chatStorage.js')).saveMessages(chatId, updatedMessages);
  
  // Уведомляем слушателей
  listeners.forEach(listener => {
    try {
      listener({ type: 'messages_read', chatId, userId, lastReadId });
    } catch (e) {
      console.error('[ChatWS] Error in listener:', e);
    }
  });
}

/**
 * Обработка обновления чата
 */
async function handleChatUpdated(payload) {
  const { addOrUpdateChat } = await import('./chatStorage.js');
  addOrUpdateChat(payload);
  
  // Уведомляем слушателей
  listeners.forEach(listener => {
    try {
      listener({ type: 'chat_updated', ...payload });
    } catch (e) {
      console.error('[ChatWS] Error in listener:', e);
    }
  });
}

/**
 * Обработка изменений участников чата
 */
async function handleMemberChanged(payload) {
  // Уведомляем слушателей
  listeners.forEach(listener => {
    try {
      listener({ type: 'members_changed', ...payload });
    } catch (e) {
      console.error('[ChatWS] Error in listener:', e);
    }
  });
}
