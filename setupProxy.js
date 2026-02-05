// setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.get-aist.ru', // Изменено на ваш бэкенд
      changeOrigin: true,
      secure: true, // Важно для HTTPS
    })
  );
};