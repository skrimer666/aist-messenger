# API для PWA Синхронизации

Документация по эндпоинтам, которые должны быть реализованы на бэкенде для поддержки PWA синхронизации.

## Эндпоинты синхронизации

### GET /api/sync/changes

Получить изменения с сервера после указанного времени.

**Query Parameters:**
- `since` (number, required) - Timestamp последней синхронизации
- `deviceId` (string, required) - ID устройства

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "chatId": "chat_456",
      "text": "Привет!",
      "senderId": "user_789",
      "timestamp": 1234567890,
      "edited": false,
      "deleted": false,
      "read": false
    }
  ],
  "chats": [
    {
      "id": "chat_456",
      "name": "Чат",
      "type": "private",
      "updatedAt": 1234567890,
      "deleted": false
    }
  ],
  "profile": {
    "id": "user_789",
    "name": "Иван",
    "avatar": "https://...",
    "status": "online"
  },
  "settings": {
    "theme": "dark",
    "notifications": true
  },
  "lastSync": 1234567890
}
```

### POST /api/sync/operation

Отправить операцию синхронизации на сервер.

**Request Body:**
```json
{
  "type": "messages|chats|profile|settings|contacts|keys",
  "operation": "send|edit|delete|create|update|read",
  "data": {
    // Данные операции
  },
  "deviceId": "device_123",
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "id": "msg_123", // ID созданного ресурса
  "timestamp": 1234567890
}
```

## Управление устройствами

### POST /api/devices/register

Зарегистрировать устройство для push-уведомлений.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "deviceId": "device_123",
  "deviceInfo": {
    "platform": "android|ios|desktop",
    "userAgent": "Mozilla/5.0...",
    "screenWidth": 1080,
    "screenHeight": 1920
  }
}
```

**Response:**
```json
{
  "success": true,
  "deviceId": "device_123"
}
```

### DELETE /api/devices/:deviceId

Отменить регистрацию устройства.

**Response:**
```json
{
  "success": true
}
```

### GET /api/devices

Получить список устройств пользователя.

**Response:**
```json
{
  "devices": [
    {
      "deviceId": "device_123",
      "platform": "android",
      "userAgent": "Mozilla/5.0...",
      "lastActive": 1234567890,
      "pushEnabled": true
    }
  ]
}
```

## Настройки

### POST /api/settings

Сохранить настройки пользователя.

**Request Body:**
```json
{
  "theme": "dark",
  "language": "ru",
  "notifications": {
    "push": true,
    "sound": true,
    "vibrate": true
  },
  "privacy": {
    "readReceipts": true,
    "typingIndicators": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "settings": { ... }
}
```

### GET /api/settings

Получить настройки пользователя.

**Response:**
```json
{
  "theme": "dark",
  "language": "ru",
  "notifications": { ... },
  "privacy": { ... }
}
```

## WebSocket события

### Клиент → Сервер

#### Сообщения синхронизации

```json
{
  "type": "sync",
  "deviceId": "device_123",
  "syncType": "message|messages_read|chat_updated|member_added|member_removed|member_role_changed|typing",
  "payload": {
    // Данные синхронизации
  }
}
```

**Типы syncType:**

- `message` - Новое сообщение
- `messages_read` - Сообщения прочитаны
- `chat_updated` - Чат обновлен
- `member_added` - Участник добавлен
- `member_removed` - Участник удален
- `member_role_changed` - Роль изменена
- `typing` - Пользователь печатает

### Сервер → Клиент

#### Синхронизация изменений

```json
{
  "type": "sync",
  "syncType": "message",
  "payload": {
    "id": "msg_123",
    "chatId": "chat_456",
    "text": "Привет!",
    "senderId": "user_789",
    "timestamp": 1234567890
  }
}
```

#### Push-уведомление

```json
{
  "type": "push",
  "title": "Новое сообщение",
  "body": "Иван: Привет!",
  "icon": "/icon-192.png",
  "data": {
    "chatId": "chat_456",
    "messageId": "msg_123",
    "url": "/?chat=chat_456"
  }
}
```

#### Статус пользователя

```json
{
  "type": "user_status",
  "userId": "user_789",
  "status": "online|offline|away",
  "deviceId": "device_123"
}
```

## База данных

### Таблица устройств

```sql
CREATE TABLE devices (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  user_agent TEXT,
  push_endpoint TEXT,
  push_p256dh VARCHAR(255),
  push_auth VARCHAR(255),
  last_active BIGINT,
  created_at BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Таблица очереди синхронизации

```sql
CREATE TABLE sync_queue (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_id VARCHAR(255),
  type VARCHAR(50),
  operation VARCHAR(50),
  data JSON,
  created_at BIGINT,
  processed_at BIGINT,
  status VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Таблица изменений синхронизации

```sql
CREATE TABLE sync_changes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  change_type VARCHAR(20),
  data JSON,
  created_at BIGINT,
  INDEX idx_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Push-уведомления

### VAPID ключи

Генерация VAPID ключей:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### Отправка push-уведомления

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your@email.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscription = {
  endpoint: 'https://fcm.googleapis.com/...',
  keys: {
    p256dh: '...',
    auth: '...'
  }
};

const payload = JSON.stringify({
  title: 'Новое сообщение',
  body: 'Иван: Привет!',
  icon: '/icon-192.png',
  data: {
    chatId: 'chat_456',
    messageId: 'msg_123'
  }
});

await webpush.sendNotification(subscription, payload);
```

## Конфликт-резолюция

### Стратегии разрешения конфликтов

1. **Last Write Wins (LWW)** - Последняя запись побеждает
   - Используется для настроек и профиля

2. **Operational Transformation (OT)** - Преобразование операций
   - Используется для редактирования сообщений

3. **Conflict-Free Replicated Data Types (CRDTs)** - Конфликтно-свободные типы
   - Используется для счетчиков и множеств

### Пример LWW

```javascript
function resolveConflict(local, remote) {
  if (local.timestamp > remote.timestamp) {
    return local; // Локальная версия новее
  } else {
    return remote; // Удаленная версия новее
  }
}
```

## Безопасность

### Валидация deviceId

```javascript
function validateDeviceId(deviceId) {
  // deviceId должен быть в формате: device_{timestamp}_{random}
  return /^device_\d+_[a-z0-9]+$/.test(deviceId);
}
```

### Проверка прав доступа

```javascript
async function checkDeviceAccess(userId, deviceId) {
  const device = await db.getDevice(deviceId);
  return device && device.userId === userId;
}
```

### Rate limiting

Ограничить количество операций синхронизации:

```javascript
const rateLimit = require('express-rate-limit');

const syncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 100, // максимум 100 запросов
  message: 'Too many sync requests'
});

app.use('/api/sync', syncLimiter);
```

## Мониторинг

### Логи

Логировать все операции синхронизации:

```javascript
logger.info('Sync operation', {
  userId,
  deviceId,
  type,
  operation,
  timestamp
});
```

### Метрики

Собирать метрики:

```javascript
metrics.increment('sync.operations.total', {
  type,
  operation,
  status
});

metrics.timing('sync.operations.duration', duration);
```

## Тестирование

### Unit тесты

```javascript
describe('Sync API', () => {
  it('should return changes since timestamp', async () => {
    const response = await request(app)
      .get('/api/sync/changes?since=1234567890&deviceId=device_123')
      .set('Authorization', 'Bearer token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('messages');
    expect(response.body).toHaveProperty('chats');
  });
});
```

### Интеграционные тесты

```javascript
describe('Sync Integration', () => {
  it('should sync message between devices', async () => {
    // Устройство 1 отправляет сообщение
    await device1.sendMessage(chatId, 'Hello');
    
    // Устройство 2 получает изменения
    const changes = await device2.getChanges(since);
    
    expect(changes.messages).toHaveLength(1);
    expect(changes.messages[0].text).toBe('Hello');
  });
});
```

## Производительность

### Оптимизация запросов

Использовать индексы:

```sql
CREATE INDEX idx_sync_changes_user_created 
ON sync_changes(user_id, created_at);
```

### Пагинация

Для больших наборов данных:

```javascript
app.get('/api/sync/changes', async (req, res) => {
  const { since, deviceId, limit = 100, offset = 0 } = req.query;
  
  const changes = await db.getChanges({
    since,
    deviceId,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  res.json(changes);
});
```

### Кэширование

Кэшировать частые запросы:

```javascript
const cache = new Map();

app.get('/api/settings', async (req, res) => {
  const userId = req.user.id;
  
  if (cache.has(userId)) {
    return res.json(cache.get(userId));
  }
  
  const settings = await db.getSettings(userId);
  cache.set(userId, settings);
  
  res.json(settings);
});
```

---

Для вопросов и предложений обращайтесь к разработчикам.
