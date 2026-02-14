# Инструкции по деплою AIST Messenger Frontend

## 🚀 Деплой на Vercel

### Автоматический деплой (рекомендуется)

1. Подключите репозиторий к Vercel
2. Vercel автоматически определит конфигурацию из `vercel.json`
3. Деплой начнётся автоматически при каждом push в главную ветку

### Конфигурация Vercel

Файл `vercel.json` уже настроен:
- **Framework**: null (автоопределение)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

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

### Ошибка: "не удалось проанализировать исходный код для анализа импорта"

Файл `frontend/src/index.jsx` имеет расширение `.jsx` для поддержки JSX. Убедитесь, что `frontend/index.html` ссылается на `/src/index.jsx`.

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
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.jsx  # Точка входа
│   ├── package.json
│   └── vite.config.js
├── vercel.json        # Конфигурация Vercel
└── package.json       # Корневой package.json
```

## ✅ Проверка перед деплоем

1. Убедитесь, что `frontend/src/index.jsx` существует
2. Проверьте, что `frontend/index.html` ссылается на `/src/index.jsx`
3. Убедитесь, что `vercel.json` настроен правильно
4. Проверьте, что `.npmrc` не содержит `legacy-peer-deps=true`

## 🎯 После деплоя

1. Проверьте, что сайт доступен по URL Vercel
2. Протестируйте основные функции:
   - Регистрация/вход
   - Отправка сообщений
   - Поиск по тегу
   - Просмотр историй
   - Звонки
