/**
 * API для синхронизации чатов и сообщений. Один аккаунт (телефон) — одни чаты на всех устройствах.
 */

const API_BASE = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location?.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.get-aist.ru');

/** URL WebSocket для звонков: тот же хост что и API, путь /ws */
export function getWsUrl() {
  if (process.env.REACT_APP_WS_URL) return process.env.REACT_APP_WS_URL;
  const base = API_BASE.replace(/^https?/, (s) => (s === 'https' ? 'wss' : 'ws'));
  return `${base.replace(/\/$/, '')}/ws`;
}

function getToken() {
  try {
    return localStorage.getItem('aist_token') || null;
  } catch {
    return null;
  }
}

async function request(method, path, body = null) {
  const token = getToken();
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body != null) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  let json = null;
  try {
    const text = await res.text();
    if (text) json = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    const err = new Error((json && (json.message || json.error)) || res.statusText || 'Request failed');
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  if (res.status === 204) return null;
  return json || {};
}

/** Список чатов с сервера (по userId из токена). При ошибке или без токена — null. */
export async function apiGetChats() {
  if (!getToken()) return null;
  try {
    return await request('GET', '/api/chats');
  } catch {
    return null;
  }
}

/** Сообщения чата с сервера. При ошибке — null. */
export async function apiGetMessages(chatId) {
  if (!getToken() || !chatId) return null;
  try {
    const list = await request('GET', `/api/chats/${encodeURIComponent(chatId)}/messages`);
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}

/** Отправить сообщение на сервер. Возвращает созданное сообщение или null при ошибке. */
export async function apiSendMessage(chatId, { text, attachment }) {
  if (!getToken() || !chatId) return null;
  try {
    return await request('POST', `/api/chats/${encodeURIComponent(chatId)}/messages`, { text: text || '', attachment: attachment || null });
  } catch (e) {
    if (e?.status === 404) console.warn('Chat not found on server:', chatId);
    return null;
  }
}

/** Создать чат на сервере. Возвращает чат или null. Для личного чата передайте peerUsername или peerUserId. */
export async function apiCreateChat(payload) {
  if (!getToken()) return null;
  try {
    return await request('POST', '/api/chats', {
      name: payload.name || 'Чат',
      type: payload.type || 'user',
      photo: payload.photo || null,
      peerUsername: payload.peerUsername || null,
      peerUserId: payload.peerUserId || null,
      description: payload.description || null,
      shareLink: payload.shareLink || null,
      admins: payload.admins || [],
      moderators: payload.moderators || [],
    });
  } catch {
    return null;
  }
}

/** Получить публичный ключ пользователя */
export async function apiGetPublicKey(userId) {
  if (!getToken() || !userId) return null;
  try {
    const res = await request('GET', `/api/users/${encodeURIComponent(userId)}/public-key`);
    return res?.publicKey || null;
  } catch {
    return null;
  }
}

/** Сохранить свой публичный ключ на сервере */
export async function apiSetPublicKey(publicKeyPem) {
  if (!getToken()) return null;
  try {
    return await request('POST', '/api/profile/public-key', { publicKey: publicKeyPem });
  } catch {
    return null;
  }
}

// ——— Stories API ———

/** Получить мои истории */
export async function apiGetMyStories() {
  if (!getToken()) return null;
  try {
    return await request('GET', '/api/stories/my');
  } catch {
    return null;
  }
}

/** Удалить историю */
export async function apiDeleteStory(storyId) {
  if (!getToken() || !storyId) return null;
  try {
    return await request('DELETE', `/api/stories/${encodeURIComponent(storyId)}`);
  } catch {
    return null;
  }
}

/** Подписаться на истории пользователя */
export async function apiSubscribeToStories(userId) {
  if (!getToken() || !userId) return null;
  try {
    return await request('POST', `/api/stories/subscribe/${encodeURIComponent(userId)}`);
  } catch {
    return null;
  }
}

/** Отписаться от историй пользователя */
export async function apiUnsubscribeFromStories(userId) {
  if (!getToken() || !userId) return null;
  try {
    return await request('DELETE', `/api/stories/subscribe/${encodeURIComponent(userId)}`);
  } catch {
    return null;
  }
}

/** Получить список подписок */
export async function apiGetStorySubscriptions() {
  if (!getToken()) return null;
  try {
    return await request('GET', '/api/stories/subscriptions');
  } catch {
    return null;
  }
}

/** Поиск пользователей по имени или никнейму */
export async function apiSearchUsers(query) {
  if (!getToken() || !query) return null;
  try {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    if (q.length < 2) return [];
    return await request('GET', `/api/users/search?q=${encodeURIComponent(q)}`);
  } catch {
    return null;
  }
}

/** Получить информацию о пользователе по ID или никнейму */
export async function apiGetUser(identifier) {
  if (!getToken() || !identifier) return null;
  try {
    return await request('GET', `/api/users/${encodeURIComponent(identifier)}`);
  } catch {
    return null;
  }
}

/** Получить информацию о чате */
export async function apiGetChat(chatId) {
  if (!getToken() || !chatId) return null;
  try {
    return await request('GET', `/api/chats/${encodeURIComponent(chatId)}`);
  } catch {
    return null;
  }
}

/** Обновить чат */
export async function apiUpdateChat(chatId, data) {
  if (!getToken() || !chatId) return null;
  try {
    return await request('PUT', `/api/chats/${encodeURIComponent(chatId)}`, data);
  } catch {
    return null;
  }
}

/** Удалить чат */
export async function apiDeleteChat(chatId) {
  if (!getToken() || !chatId) return null;
  try {
    return await request('DELETE', `/api/chats/${encodeURIComponent(chatId)}`);
  } catch {
    return null;
  }
}

/** Добавить участника в чат */
export async function apiAddMember(chatId, data) {
  if (!getToken() || !chatId) return null;
  try {
    return await request('POST', `/api/chats/${encodeURIComponent(chatId)}/members`, data);
  } catch {
    return null;
  }
}

/** Удалить участника из чата */
export async function apiRemoveMember(chatId, userId) {
  if (!getToken() || !chatId || !userId) return null;
  try {
    return await request('DELETE', `/api/chats/${encodeURIComponent(chatId)}/members/${encodeURIComponent(userId)}`);
  } catch {
    return null;
  }
}

/** Обновить роль участника */
export async function apiUpdateMemberRole(chatId, userId, role) {
  if (!getToken() || !chatId || !userId) return null;
  try {
    return await request('PUT', `/api/chats/${encodeURIComponent(chatId)}/members/${encodeURIComponent(userId)}`, { role });
  } catch {
    return null;
  }
}

/** Получить список историй */
export async function apiGetStories() {
  // Сначала пробуем получить с сервера
  if (getToken()) {
    try {
      const serverStories = await request('GET', '/api/stories');
      if (Array.isArray(serverStories)) {
        // Обновляем локальное хранилище данными с сервера
        const { saveStories, getUnviewedStories } = await import('./storyStorage');
        saveStories(serverStories);
        return serverStories;
      }
    } catch (error) {
      console.log('Server stories not available, using local storage');
    }
  }
  
  // Если сервер недоступен, используем локальное хранилище
  const { getUnviewedStories } = await import('./storyStorage');
  return getUnviewedStories();
}

/** Отметить историю как просмотренную */
export async function apiViewStory(storyId) {
  // Сначала отмечаем локально
  const { markStoryAsViewed } = await import('./storyStorage');
  markStoryAsViewed(storyId);
  
  // Затем отправляем на сервер если доступен
  if (getToken()) {
    try {
      return await request('POST', `/api/stories/${storyId}/view`);
    } catch {
      // Ошибка не критична, т.к. уже отмечено локально
      return { ok: true };
    }
  }
  
  return { ok: true };
}

/** Создать историю */
export async function apiCreateStory(data) {
  const { addStory } = await import('./storyStorage');
  
  // Сначала создаём локально
  const newStory = addStory(data);
  
  // Затем отправляем на сервер если доступен
  if (getToken()) {
    try {
      const serverStory = await request('POST', '/api/stories', data);
      if (serverStory?.id) {
        // Обновляем ID на тот, что с сервера
        const { getStories, saveStories } = await import('./storyStorage');
        const stories = getStories();
        // Находим и обновляем историю по временному ID
        for (const user of stories) {
          const storyIndex = user.stories?.findIndex(s => s.id === newStory.id);
          if (storyIndex >= 0) {
            user.stories[storyIndex] = { ...user.stories[storyIndex], ...serverStory };
            saveStories(stories);
            break;
          }
        }
        return serverStory;
      }
    } catch {
      // Ошибка не критична, т.к. уже создано локально
      return newStory;
    }
  }
  
  return newStory;
}
