const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.get-aist.ru',
      changeOrigin: true,
      secure: true,
    })
  );
};