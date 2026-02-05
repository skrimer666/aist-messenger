// src/setupProxy.js (убедитесь, что находится в папке src/)
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://45.150.10.220:3001', // Или ваш актуальный бэкенд
      changeOrigin: true,
    })
  );
};