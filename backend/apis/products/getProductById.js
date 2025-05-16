const getProductByIdModel = require('../../models/products/getProductByIdModel');

async function getProductById(req, res, id) {
  try {
    const product = await getProductByIdModel(id);
    if (!product) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Product not found' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(product));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = getProductById;