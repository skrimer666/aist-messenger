# AIST Messenger - PWA и Синхронизация

## Обзор

AIST Messenger теперь полностью адаптирован как Progressive Web App (PWA) с полной синхронизацией данных между устройствами.

## Основные возможности

### 1. PWA Функции

- **Установка на устройство**: Возможность установки на домашний экран (Android/iOS)
- **Офлайн работа**: Полная функциональность без интернета
- **Push-уведомления**: Получение уведомлений о новых сообщениях
- **Быстрый запуск**: Мгновенное открытие как нативное приложение
- **Автоматические обновления**: Фоновое обновление Service Worker

### 2. Синхронизация данных

- **Реальное время**: Мгновенная синхронизация через WebSocket
- **Офлайн очередь**: Сохранение операций при отсутствии интернета
- **Конфликт-резолюция**: Автоматическое разрешение конфликтов
- **Кросс-устройство**: Синхронизация между всеми устройствами пользователя
- **Приоритизация**: Важные операции синхронизируются первыми

## Структура файлов

### Service Worker
- `frontend/public/sw.js` - Кэширование ресурсов и офлайн работа

### Менеджер синхронизации
- `frontend/src/lib/syncManager.js` - Управление синхронизацией данных
- `frontend/src/lib/syncedChat.js` - Обертка для операций с чатами с синхронизацией

### Компоненты PWA
- `frontend/src/components/PWAInstall.jsx` - Установка PWA и управление уведомлениями
- `frontend/src/components/SyncStatus.jsx` - Отображение статуса синхронизации

### Конфигурация
- `frontend/public/manifest.json` - Манифест PWA
- `frontend/index.html` - Регистрация Service Worker и мета-теги

## Использование

### Инициализация

Менеджер синхронизации инициализируется автоматически в `App.jsx`:

```javascript
import { initSyncManager } from './lib/syncManager';

// В useEffect
initSyncManager();
```

### Отправка сообщений с синхронизацией

Используйте функции из `syncedChat.js` вместо прямых API вызовов:

```javascript
import { sendMessage } from './lib/syncedChat';

// Отправка сообщения
await sendMessage(chatId, 'Привет!', []);

// Сообщение будет:
// 1. Сохранено локально
// 2. Добавлено в очередь синхронизации
// 3. Отправлено на сервер (если онлайн)
// 4. Синхронизировано на другие устройства
```

### Доступные операции

```javascript
import {
  sendMessage,
  editMessage,
  deleteMessage,
  markMessagesAsRead,
  createChat,
  updateChat,
  deleteChat,
  addMember,
  removeMember,
  updateMemberRole,
  updateProfile,
  updateSettings
} from './lib/syncedChat';
```

### Мониторинг синхронизации

```javascript
import { addSyncListener, getSyncStats, SYNC_STATUS } from './lib/syncManager';

// Добавить слушатель
addSyncListener((data) => {
  console.log('Статус синхронизации:', data.status);
  console.log('Онлайн:', data.online);
  console.log('Профиль обновлен:', data.profile);
});

// Получить статистику
const stats = getSyncStats();
console.log(stats);
// {
//   deviceId: 'device_123...',
//   status: 'idle',
//   queueLength: 0,
//   lastSync: 1234567890,
//   isOnline: true
// }
```

### Ручная синхронизация

```javascript
import { fullSync, clearSyncQueue } from './lib/syncManager';

// Полная синхронизация
await fullSync();

// Очистить очередь (если нужно)
clearSyncQueue();
```

## Работа офлайн

### Автоматическая офлайн работа

Когда приложение теряет соединение:

1. **Service Worker** продолжает обслуживать кэшированные ресурсы
2. **Операции** добавляются в очередь синхронизации
3. **Данные** сохраняются в IndexedDB/localStorage
4. **UI** показывает офлайн статус

### Восстановление соединения

При восстановлении соединения:

1. Автоматически запускается процесс синхронизации
2. Очередь операций обрабатывается в порядке приоритета
3. Изменения с сервера применяются к локальным данным
4. Пользователь получает уведомление о завершении

## Push-уведомления

### Подписка на уведомления

Компонент `PWAInstall` предоставляет кнопку для управления уведомлениями.

Программная подписка:

```javascript
import { subscribeToNotifications, unsubscribeFromNotifications } from './lib/syncManager';

// Подписаться
await subscribeToNotifications();

// Отписаться
await unsubscribeFromNotifications();
```

### Формат уведомлений

```javascript
{
  title: 'AIST Messenger',
  body: 'Новое сообщение от Иван',
  icon: '/icon-192.png',
  data: {
    url: '/?chat=123',
    chatId: '123',
    messageId: '456'
  }
}
```

## Установка на устройство

### Android (Chrome)

1. Откройте приложение в Chrome
2. Нажмите на меню (⋮)
3. Выберите "Установить приложение" или "Добавить на главный экран"

### iOS (Safari)

1. Откройте приложение в Safari
2. Нажмите кнопку "Поделиться" (⎙)
3. Прокрутите вниз и выберите "На экран Домой"

### Desktop (Chrome/Edge)

1. Откройте приложение
2. Нажмите на иконку установки в адресной строке
3. Подтвердите установку

## Конфигурация

### Service Worker

Настройки кэширования в `sw.js`:

```javascript
const STATIC_CACHE = 'aist-static-v1';
const DATA_CACHE = 'aist-data-v1';

// Шаблоны API для кэширования
const API_CACHE_PATTERNS = [
  /\/api\/chats/,
  /\/api\/messages/,
  /\/api\/users/,
  /\/api\/profile/
];
```

### Manifest

Основные настройки в `manifest.json`:

```json
{
  "name": "AIST Messenger",
  "short_name": "AIST",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "theme_color": "#7eb8e8",
  "background_color": "#e8eef7",
  "icons": [...]
}
```

## API для бэкенда

### Эндпоинты синхронизации

```
GET  /api/sync/changes?since={timestamp}&deviceId={id}
POST /api/sync/operation
POST /api/devices/register
DELETE /api/devices/{deviceId}
GET  /api/devices
POST /api/settings
GET  /api/settings
```

### WebSocket события

```javascript
// Клиент → Сервер
{
  type: 'sync',
  deviceId: 'device_123',
  syncType: 'message',
  payload: { ... }
}

// Сервер → Клиент
{
  type: 'sync',
  syncType: 'message',
  payload: { ... }
}
```

## Устранение проблем

### Service Worker не обновляется

```javascript
// В консоли браузера
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

### Синхронизация не работает

1. Проверьте статус онлайн: `navigator.onLine`
2. Проверьте очередь: `getSyncStats().queueLength`
3. Очистите кэш: `clearSyncQueue()`
4. Перезагрузите Service Worker

### Push-уведомления не приходят

1. Проверьте разрешение: `Notification.permission`
2. Убедитесь что VAPID ключи настроены
3. Проверьте подписку: `registration.pushManager.getSubscription()`

## Мониторинг

### Логи

Service Worker и SyncManager логируют все операции:

```javascript
// Service Worker
[SW] Installing...
[SW] Caching static assets
[SW] Activating...

// SyncManager
[SyncManager] Initializing...
[SyncManager] Queued operation: {...}
[SyncManager] Processing queue, items: 5
[SyncManager] Full sync completed
```

### Отладка

Включите детальное логирование:

```javascript
localStorage.setItem('aist_debug', 'true');
```

## Безопасность

### End-to-End шифрование

- Ключи шифрования хранятся локально
- Синхронизация ключей между устройствами (требует подтверждения)
- Сообщения шифруются перед отправкой

### Безопасность данных

- Токены не кэшируются
- API запросы требуют валидации
- Service Worker не кэширует чувствительные данные

## Производительность

### Оптимизация

1. **Кэширование**: Статические ресурсы кэшируются при первой загрузке
2. **Lazy loading**: Компоненты загружаются по требованию
3. **Debounce**: Частые операции объединяются
4. **Priority**: Важные операции обрабатываются первыми

### Рекомендации

- Минимизируйте размер attachments
- Используйте сжатие изображений
- Очищайте старые сообщения периодически
- Следите за размером кэша

## Будущие улучшения

- [ ] Фоновая синхронизация (Background Sync API)
- [ ] Периодическая синхронизация (Periodic Background Sync)
- [ ] Share API для обмена контентом
- [ ] File System Access API для работы с файлами
- [ ] Badges API для показа счетчика на иконке
- [ ] Web Share Target для получения контента из других приложений

## Поддержка

Для вопросов и предложений по PWA и синхронизации обращайтесь к разработчикам.
