// Этот файл использовался для Create React App
// Для Vite проксирование настроено в frontend/vite.config.js
// Этот файл оставлен для совместимости, но не используется

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );

  app.use(
    '/ws',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      changeOrigin: true,
      ws: true
    })
  );
};