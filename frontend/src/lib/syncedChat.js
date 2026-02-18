/**
 * Обертка для работы с чатами с поддержкой синхронизации
 * Все операции автоматически добавляются в очередь синхронизации
 */

import {
  queueSyncOperation,
  SYNC_TYPES
} from './syncManager';

/**
 * Отправить сообщение с синхронизацией
 */
export async function sendMessage(chatId, text, attachments = []) {
  const { apiPost } = await import('./api.js');
  const { appendMessage } = await import('./chatStorage.js');
  
  // Создаем временное сообщение
  const tempMessage = {
    id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    chatId,
    text,
    attachments,
    senderId: JSON.parse(localStorage.getItem('aist_user') || '{}').id,
    timestamp: Date.now(),
    pending: true
  };
  
  // Сохраняем локально
  await appendMessage(chatId, tempMessage);
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.MESSAGES, 'send', {
    chatId,
    text,
    attachments,
    tempId: tempMessage.id
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    const response = await apiPost('/api/messages', {
      chatId,
      text,
      attachments
    });
    
    // Обновляем сообщение с реальным ID
    if (response?.id) {
      const messages = await (await import('./chatStorage.js')).getMessages(chatId);
      const updatedMessages = messages.map(msg => 
        msg.id === tempMessage.id ? { ...response, pending: false } : msg
      );
      await (await import('./chatStorage.js')).saveMessages(chatId, updatedMessages);
    }
    
    return response;
  } catch (error) {
    console.error('[SyncedChat] Error sending message:', error);
    // Сообщение останется в очереди синхронизации
    return tempMessage;
  }
}

/**
 * Редактировать сообщение с синхронизацией
 */
export async function editMessage(chatId, messageId, newText) {
  const { apiPost } = await import('./api.js');
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.MESSAGES, 'edit', {
    chatId,
    messageId,
    text: newText
  });
  
  // Обновляем локально
  const messages = await (await import('./chatStorage.js')).getMessages(chatId);
  const updatedMessages = messages.map(msg => 
    msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
  );
  await (await import('./chatStorage.js')).saveMessages(chatId, updatedMessages);
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiPost(`/api/messages/${messageId}/edit`, {
      text: newText
    });
  } catch (error) {
    console.error('[SyncedChat] Error editing message:', error);
    return null;
  }
}

/**
 * Удалить сообщение с синхронизацией
 */
export async function deleteMessage(chatId, messageId) {
  const { apiPost } = await import('./api.js');
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.MESSAGES, 'delete', {
    chatId,
    messageId
  });
  
  // Обновляем локально (помечаем как удаленное)
  const messages = await (await import('./chatStorage.js')).getMessages(chatId);
  const updatedMessages = messages.map(msg => 
    msg.id === messageId ? { ...msg, deleted: true } : msg
  );
  await (await import('./chatStorage.js')).saveMessages(chatId, updatedMessages);
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiPost(`/api/messages/${messageId}/delete`);
  } catch (error) {
    console.error('[SyncedChat] Error deleting message:', error);
    return null;
  }
}

/**
 * Отметить сообщения как прочитанные с синхронизацией
 */
export async function markMessagesAsRead(chatId, lastReadId) {
  const { apiPost } = await import('./api.js');
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.MESSAGES, 'read', {
    chatId,
    lastReadId
  });
  
  // Обновляем локально
  const messages = await (await import('./chatStorage.js')).getMessages(chatId);
  const userId = JSON.parse(localStorage.getItem('aist_user') || '{}').id;
  const updatedMessages = messages.map(msg => 
    msg.senderId === userId && msg.id <= lastReadId ? { ...msg, read: true } : msg
  );
  await (await import('./chatStorage.js')).saveMessages(chatId, updatedMessages);
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiPost(`/api/chats/${chatId}/read`, { lastReadId });
  } catch (error) {
    console.error('[SyncedChat] Error marking as read:', error);
    return null;
  }
}

/**
 * Создать чат с синхронизацией
 */
export async function createChat(data) {
  const { apiPost } = await import('./api.js');
  const { createChat: createLocalChat } = await import('./chatStorage.js');
  
  // Создаем локально с временным ID
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const chatData = { ...data, id: tempId };
  createLocalChat(chatData);
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.CHATS, 'create', {
    ...data,
    tempId
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    const response = await apiPost('/api/chats', data);
    
    // Обновляем с реальным ID
    if (response?.id && response.id !== tempId) {
      const { addOrUpdateChat, deleteChat } = await import('./chatStorage.js');
      deleteChat(tempId);
      addOrUpdateChat(response);
    }
    
    return response;
  } catch (error) {
    console.error('[SyncedChat] Error creating chat:', error);
    return { ...chatData, pending: true };
  }
}

/**
 * Обновить чат с синхронизацией
 */
export async function updateChat(chatId, data) {
  const { apiPut } = await import('./api.js');
  const { addOrUpdateChat } = await import('./chatStorage.js');
  
  // Обновляем локально
  addOrUpdateChat({ id: chatId, ...data });
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.CHATS, 'update', {
    chatId,
    ...data
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiPut(`/api/chats/${chatId}`, data);
  } catch (error) {
    console.error('[SyncedChat] Error updating chat:', error);
    return null;
  }
}

/**
 * Удалить чат с синхронизацией
 */
export async function deleteChat(chatId) {
  const { apiDeleteChat } = await import('./api.js');
  const { deleteChat: deleteLocalChat } = await import('./chatStorage.js');
  
  // Удаляем локально
  deleteLocalChat(chatId);
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.CHATS, 'delete', {
    chatId
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiDeleteChat(chatId);
  } catch (error) {
    console.error('[SyncedChat] Error deleting chat:', error);
    return null;
  }
}

/**
 * Добавить участника в чат с синхронизацией
 */
export async function addMember(chatId, userId, role = 'member') {
  const { apiAddMember } = await import('./api.js');
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.CHATS, 'add_member', {
    chatId,
    userId,
    role
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiAddMember(chatId, { userId, role });
  } catch (error) {
    console.error('[SyncedChat] Error adding member:', error);
    return null;
  }
}

/**
 * Удалить участника из чата с синхронизацией
 */
export async function removeMember(chatId, userId) {
  const { apiRemoveMember } = await import('./api.js');
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.CHATS, 'remove_member', {
    chatId,
    userId
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiRemoveMember(chatId, userId);
  } catch (error) {
    console.error('[SyncedChat] Error removing member:', error);
    return null;
  }
}

/**
 * Обновить роль участника с синхронизацией
 */
export async function updateMemberRole(chatId, userId, role) {
  const { apiUpdateMemberRole } = await import('./api.js');
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.CHATS, 'update_role', {
    chatId,
    userId,
    role
  });
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiUpdateMemberRole(chatId, userId, role);
  } catch (error) {
    console.error('[SyncedChat] Error updating member role:', error);
    return null;
  }
}

/**
 * Обновить профиль с синхронизацией
 */
export async function updateProfile(data) {
  const { apiPost } = await import('./api.js');
  
  // Обновляем локально
  const currentUser = JSON.parse(localStorage.getItem('aist_user') || '{}');
  const updatedUser = { ...currentUser, ...data };
  localStorage.setItem('aist_user', JSON.stringify(updatedUser));
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.PROFILE, 'update', data);
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiPost('/api/profile', data);
  } catch (error) {
    console.error('[SyncedChat] Error updating profile:', error);
    return null;
  }
}

/**
 * Обновить настройки с синхронизацией
 */
export async function updateSettings(settings) {
  const { apiSyncSettings } = await import('./api.js');
  
  // Обновляем локально
  const currentSettings = JSON.parse(localStorage.getItem('aist_settings') || '{}');
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem('aist_settings', JSON.stringify(updatedSettings));
  
  // Добавляем в очередь синхронизации
  queueSyncOperation(SYNC_TYPES.SETTINGS, 'update', settings);
  
  // Пытаемся отправить сразу если онлайн
  try {
    return await apiSyncSettings(settings);
  } catch (error) {
    console.error('[SyncedChat] Error updating settings:', error);
    return null;
  }
}
