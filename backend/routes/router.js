const productController = require('../controllers/productController');

module.exports = (req, res) => {
  if (req.url === '/api/products' && req.method === 'GET') {
    productController.getAllProducts(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
};