# AIST Messenger Frontend

Современный мессенджер с фокусом на безопасность и конфиденциальность.

## 📁 Структура проекта

```
aist-messenger/
├── frontend/          # React фронтенд (Vite)
│   ├── src/
│   │   ├── components/   # Компоненты UI
│   │   ├── context/      # React Context
│   │   ├── lib/          # Утилиты (API, E2E, WebSocket, Storage)
│   │   ├── pages/        # Страницы
│   │   ├── constants/    # Константы
│   │   ├── App.jsx       # Главный компонент
│   │   └── index.js      # Точка входа
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── package.json       # Корневой для управления скриптами
├── vercel.json        # Конфигурация Vercel
└── README.md
```

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Вариант 1: Из корня
npm install
npm run dev

# Вариант 2: Из папки frontend
cd frontend
npm install
npm run dev
```

Фронтенд: http://localhost:5173

### Сборка проекта

```bash
npm run build
```

### Запуск production версии

```bash
npm run preview
```

## 🌐 Деплой на Vercel

Проект автоматически настроен для деплоя на Vercel. Просто подключите репозиторий к Vercel.

Конфигурация в `vercel.json`:
- Framework: Vite
- Build: `cd frontend && npm run build`
- Output: `frontend/dist`

## 📝 Документация

- [QUICK_START.md](QUICK_START.md) - Быстрый старт
- [SUMMARY.md](SUMMARY.md) - Описание проекта
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Руководство по деплою
- [SECURITY.md](SECURITY.md) - Безопасность

## ✨ Возможности

- 🔐 Сквозное шифрование (E2E)
- 📞 Голосовые и видеозвонки (WebRTC)
- 💬 Личные и групповые чаты
- 📺 Каналы и истории (с локальным хранилищем)
- 🎨 6 тем оформления
- 📱 Адаптивный дизайн
- 🔍 Поиск по тегу (@username)
- 💾 Локальное хранилище для оффлайн-режима

## 📄 Лицензия

MIT
