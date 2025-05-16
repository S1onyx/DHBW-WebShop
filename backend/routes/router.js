// backend/routes/router.js
const getAllProducts = require('../apis/products/getAllProducts');
const getProductById = require('../apis/products/getProductById');
const putProduct = require('../apis/products/putProduct');

const getUserById = require('../apis/users/getUserById');

module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Product APIs
  if (url.pathname === '/api/products' && req.method === 'GET') {
    getAllProducts(req, res, url.searchParams);
  } else if (url.pathname.match(/^\/api\/products\/(\d+)$/) && req.method === 'GET') {
    const id = url.pathname.split('/').pop();
    getProductById(req, res, id);
  } else if (url.pathname.match(/^\/api\/products\/(\d+)$/) && req.method === 'PUT') {
    const id = url.pathname.split('/').pop();
    putProduct(req, res, id);

  // User APIs
  } else if (url.pathname.match(/^\/api\/users\/(\d+)$/) && req.method === 'GET') {
    const id = url.pathname.split('/').pop();
    getUserById(req, res, id);

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
};