// backend/apis/products/getProductById.js
const getProductByIdModel = require('../../models/products/getProductByIdModel');

async function getProductById(req, res, id) {
  try {
    const product = await getProductByIdModel(id);

    if (!product) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Product not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: product }));
  } catch (err) {
    console.error('[GET PRODUCT BY ID ERROR]', { id, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getProductById;