# AIST Messenger

Современный мессенджер с фокусом на безопасность и конфиденциальность.

## 📁 Структура проекта

```
aist-messenger/
├── frontend/          # React фронтенд (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js бэкенд (Express)
│   ├── src/
│   └── package.json
└── package.json       # Корневой для управления скриптами
```

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm run install:all
```

### Запуск в режиме разработки

```bash
npm run dev
```

- Фронтенд: http://localhost:5173
- Бэкенд: http://localhost:3000

### Сборка проекта

```bash
npm run build
```

### Запуск production версии

```bash
npm run start
```

## 🛠 Отдельный запуск

### Только фронтенд

```bash
cd frontend
npm install
npm run dev
```

### Только бэкенд

```bash
cd backend
npm install
npm run dev
```

## 📝 Документация

- [QUICK_START.md](QUICK_START.md) - Быстрый старт
- [SUMMARY.md](SUMMARY.md) - Описание проекта
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Руководство по деплою
- [SECURITY.md](SECURITY.md) - Безопасность

## ✨ Возможности

- 🔐 Сквозное шифрование (E2E)
- 📞 Голосовые и видеозвонки (WebRTC)
- 💬 Личные и групповые чаты
- 📺 Каналы и истории
- 🎨 6 тем оформления
- 📱 Адаптивный дизайн

## 📄 Лицензия

MIT
