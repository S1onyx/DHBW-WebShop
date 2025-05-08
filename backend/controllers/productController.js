const productModel = require('../models/productModel');

async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAll();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = {
  getAllProducts,
};