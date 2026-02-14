# AIST Messenger Frontend

Современный мессенджер с фокусом на безопасность и конфиденциальность.

## 📁 Структура проекта

```
aist-messenger/
├── frontend/          # React фронтенд (Vite)
│   ├── src/
│   │   ├── components/   # Компоненты UI
│   │   ├── context/      # React Context
│   │   ├── lib/          # Утилиты (API, E2E, WebSocket)
│   │   ├── pages/        # Страницы
│   │   ├── constants/    # Константы
│   │   ├── App.jsx       # Главный компонент
│   │   └── index.js      # Точка входа
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── package.json       # Корневой для управления скриптами
└── README.md
```

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

- Фронтенд: http://localhost:5173

### Сборка проекта

```bash
npm run build
```

### Запуск production версии

```bash
npm run preview
```

## 🛠 Ручной запуск в папке frontend

```bash
cd frontend
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
