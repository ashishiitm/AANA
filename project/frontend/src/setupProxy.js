const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Django API proxy
  app.use(
    [
      '/api',
      '/active-trials',
      '/featured-studies',
      '/stats/database'
    ],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/active-trials': '/api/trials/active',
        '^/featured-studies': '/api/studies/featured',
        '^/stats/database': '/api/stats/database'
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ 
          message: 'Error connecting to Django backend',
          error: err.message
        }));
      }
    })
  );

  // Node.js API proxy
  app.use(
    '/node-api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/node-api': '/api'
      },
      onError: (err, req, res) => {
        console.error('Node API Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ 
          message: 'Error connecting to Node.js backend',
          error: err.message
        }));
      }
    })
  );
}; 