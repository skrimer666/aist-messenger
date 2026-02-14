# Инструкции по деплою AIST Messenger Frontend

## 🚀 Деплой на Vercel

### Автоматический деплой (рекомендуется)

1. Подключите репозиторий к Vercel
2. Vercel автоматически определит конфигурацию из `vercel.json`
3. Деплой начнётся автоматически при каждом push в главную ветку

### Конфигурация Vercel

Файл `vercel.json` уже настроен:
- **Framework**: Vite
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

## 🖥️ Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Предпросмотр production сборки
npm run preview
```

## 📦 Требования

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

## 🔧 Устранение проблем

### Ошибка: "cross-env: команда не найдена"

Убедитесь, что используете Vite (не Create React App):
```bash
cd frontend
npm run build
```

### Ошибка: "ENOENT: такого файла или каталога нет"

Запускайте команды из корневой директории:
```bash
npm install
npm run build
```

### Проблемы с зависимостями

Если возникают проблемы с установкой:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🌐 Переменные окружения (опционально)

Для подключения к бэкенду можно добавить в Vercel:

```
VITE_API_URL=https://your-backend.com
```

## 📁 Структура проекта

```
aist-messenger/
├── frontend/          # Фронтенд (Vite + React)
│   ├── dist/          # Сборка (генерируется автоматически)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── vercel.json        # Конфигурация Vercel
└── package.json       # Корневой package.json
```

## ✅ Проверка перед деплоем

1. Убедитесь, что `frontend/package.json` использует Vite
2. Проверьте, что `vercel.json` настроен правильно
3. Убедитесь, что `.npmrc` не содержит `legacy-peer-deps=true`

## 🎯 После деплоя

1. Проверьте, что сайт доступен по URL Vercel
2. Протестируйте основные функции:
   - Регистрация/вход
   - Отправка сообщений
   - Поиск по тегу
   - Просмотр историй
   - Звонки
