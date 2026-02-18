# AIST Messenger PWA

Полная адаптация AIST Messenger как Progressive Web App с синхронизацией данных между устройствами.

## 📱 Возможности

### PWA Функции
- ✅ Установка на устройство (Android/iOS/Desktop)
- ✅ Офлайн работа
- ✅ Push-уведомления
- ✅ Быстрый запуск
- ✅ Автоматические обновления

### Синхронизация
- ✅ Реальное время (WebSocket)
- ✅ Офлайн очередь
- ✅ Конфликт-резолюция
- ✅ Кросс-устройство
- ✅ Приоритизация операций

## 🚀 Быстрый старт

### Установка зависимостей

```bash
cd frontend
npm install
```

### Генерация иконок

Для работы PWA нужны иконки разных размеров:

```bash
# Поместите исходную иконку (минимум 512x512) в public/icon.png
npm run pwa:generate-icons
```

### Разработка

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Сборка для продакшена

```bash
npm run build
```

Результат будет в папке `dist/`

### Проверка PWA

```bash
# Базовая проверка файлов и конфигурации
npm run pwa:check

# Полная проверка с Lighthouse (требует запущенного сервера)
npm run pwa:check-full
```

## 📲 Установка на устройство

### Android (Chrome)
1. Откройте приложение в Chrome
2. Нажмите меню (⋮)
3. "Установить приложение"

### iOS (Safari)
1. Откройте приложение в Safari
2. Нажмите "Поделиться" (⎙)
3. "На экран Домой"

### Desktop (Chrome/Edge)
1. Откройте приложение
2. Нажмите иконку установки в адресной строке
3. Подтвердите установку

## 🔧 Конфигурация

### Service Worker

Файл: `public/sw.js`

Настройки кэширования:
```javascript
const STATIC_CACHE = 'aist-static-v1';
const DATA_CACHE = 'aist-data-v1';

const API_CACHE_PATTERNS = [
  /\/api\/chats/,
  /\/api\/messages/,
  /\/api\/users/,
  /\/api\/profile/
];
```

### Manifest

Файл: `public/manifest.json`

Основные настройки:
```json
{
  "name": "AIST Messenger",
  "short_name": "AIST",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "theme_color": "#7eb8e8"
}
```

## 📡 Синхронизация данных

### Использование

Все операции автоматически синхронизируются при использовании функций из `syncedChat.js`:

```javascript
import { sendMessage } from './lib/syncedChat';

// Отправка с синхронизацией
await sendMessage(chatId, 'Привет!', []);
```

### Мониторинг

```javascript
import { addSyncListener, getSyncStats } from './lib/syncManager';

// Слушатель изменений
addSyncListener((data) => {
  console.log('Статус:', data.status);
});

// Статистика
const stats = getSyncStats();
console.log(stats);
```

### Ручная синхронизация

```javascript
import { fullSync } from './lib/syncManager';

// Полная синхронизация
await fullSync();
```

## 🔔 Push-уведомления

### Настройка VAPID

Для push-уведомлений нужны VAPID ключи:

```bash
# Генерация ключей
npx web-push generate-vapid-keys
```

Добавьте в `.env`:
```
VITE_VAPID_PUBLIC_KEY=ваш_публичный_ключ
VITE_VAPID_PRIVATE_KEY=ваш_приватный_ключ
```

### Подписка

Компонент `PWAInstall` предоставляет кнопку управления уведомлениями.

Программно:
```javascript
import { subscribeToNotifications } from './lib/syncManager';

await subscribeToNotifications();
```

## 🧪 Тестирование

### Офлайн режим

1. Откройте DevTools → Network
2. Выберите "Offline"
3. Попробуйте отправить сообщение
4. Сообщение сохранится в очередь
5. Включите "Online" - сообщение отправится

### Service Worker

1. DevTools → Application → Service Workers
2. Проверьте статус (активен/ожидает)
3. "Update on reload" для отладки

### Push-уведомления

1. DevTools → Application → Service Workers
2. Нажмите "Push"
3. Проверьте появление уведомления

## 🛠️ Устранение проблем

### Service Worker не обновляется

```javascript
// В консоли браузера
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

### Очистить кэш

```bash
npm run pwa:clear-cache
```

Затем в браузере:
1. DevTools → Application → Service Workers
2. Unregister
3. Перезагрузите страницу

### Синхронизация не работает

```javascript
// Проверьте статус
import { getSyncStats } from './lib/syncManager';

const stats = getSyncStats();
console.log(stats);

// Очистите очередь если нужно
import { clearSyncQueue } from './lib/syncManager';
clearSyncQueue();
```

## 📊 Мониторинг

### Логи

Service Worker и SyncManager логируют операции:

```
[SW] Installing...
[SW] Caching static assets
[SyncManager] Initializing...
[SyncManager] Queued operation: {...}
```

### Отладка

Включите детальное логирование:
```javascript
localStorage.setItem('aist_debug', 'true');
```

## 🔒 Безопасность

- End-to-End шифрование сообщений
- Ключи хранятся локально
- Токены не кэшируются
- API запросы требуют валидации

## 📁 Структура

```
frontend/
├── public/
│   ├── manifest.json          # PWA манифест
│   ├── sw.js                  # Service Worker
│   └── icon-*.png             # Иконки
├── src/
│   ├── lib/
│   │   ├── syncManager.js     # Менеджер синхронизации
│   │   ├── syncedChat.js      # Обертка для чатов
│   │   └── chatWebSocket.js   # WebSocket с синхронизацией
│   └── components/
│       ├── PWAInstall.jsx     # Установка PWA
│       └── SyncStatus.jsx     # Статус синхронизации
└── scripts/
    ├── generate-icons.js      # Генерация иконок
    ├── clear-cache.js         # Очистка кэша
    └── pwa-lighthouse.js      # Проверка PWA
```

## 📚 Документация

Полная документация: [PWA_GUIDE.md](./PWA_GUIDE.md)

## 🤝 Поддержка

Для вопросов и предложений:
- GitHub Issues
- Документация в PWA_GUIDE.md

## 📄 Лицензия

MIT License

## 🔄 Обновления

### Будущие улучшения
- [ ] Background Sync API
- [ ] Periodic Background Sync
- [ ] Share API
- [ ] File System Access API
- [ ] Badges API
- [ ] Web Share Target

---

Создано с ❤️ для AIST Messenger
