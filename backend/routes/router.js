// backend/routes/router.js
const getAllProducts = require('../apis/products/getAllProducts');
const getProductById = require('../apis/products/getProductById');
const putProduct = require('../apis/products/putProduct');
const deleteProduct = require('../apis/products/deleteProduct');

const getUserById = require('../apis/users/getUserById');

const postCart = require('../apis/cart/postCart');
const postCartItem = require('../apis/cart/postCartItem');
const getCart = require('../apis/cart/getCart');
const deleteCartItem = require('../apis/cart/deleteCartItem');
const deleteCart = require('../apis/cart/deleteCart');
const putQuantity = require('../apis/cart/putQuantity');

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
  } else if (url.pathname.match(/^\/api\/products\/(\d+)$/) && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    deleteProduct(req, res, new URLSearchParams(`id=${id}`));
  // User APIs
  } else if (url.pathname.match(/^\/api\/users\/(\d+)$/) && req.method === 'GET') {
    const id = url.pathname.split('/').pop();
    getUserById(req, res, id);
  // Cart APIs
  } else if (url.pathname.match(/^\/api\/carts\/(\d+)$/) && req.method === 'GET') {
    const cartId = url.pathname.split('/').pop();
    getCart(req, res, cartId);
  } else if (url.pathname.match(/^\/api\/carts\/items\/(\d+)$/) && req.method === 'POST') {
    const cartId = url.pathname.split('/').pop();
    const productId = url.searchParams.get('productId');
    const quantity = url.searchParams.get('quantity');
    postCartItem(req, res, cartId, productId, quantity);
  } else if (url.pathname.match(/^\/api\/carts\/(\d+)$/) && req.method === 'POST') {
    const userId = url.pathname.split('/').pop();
    postCart(req, res, userId);
  } else if (url.pathname.match(/^\/api\/carts\/items\/(\d+)$/) && req.method === 'DELETE') {
    const cartId = url.pathname.split('/').pop();
    const productId = url.searchParams.get('productId');
    deleteCartItem(req, res, cartId, productId);
  } else if (url.pathname.match(/^\/api\/carts\/(\d+)$/) && req.method === 'DELETE'){
    const cartId = url.pathname.split('/').pop();
    deleteCart(req, res, cartId);
  } else if (url.pathname.match(/^\/api\/carts\/items\/(\d+)$/) && req.method === 'PUT') {
    const cartId = url.pathname.split('/').pop();
    const productId = url.searchParams.get('productId');
    const quantity = url.searchParams.get('quantity');
    putQuantity(req, res, cartId, productId, quantity);
  // Route not found
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: 'Route not found'}));
  }
};

