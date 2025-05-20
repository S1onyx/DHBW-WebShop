// backend/apis/products/deleteProduct.js
const deleteProductModel = require('../../models/products/deleteProductModel');

async function deleteProduct(req, res, params) {
  try {
    const id = parseInt(params.get('id'), 10);
    if (isNaN(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid product ID', code: 400 }));
    }

    const success = await deleteProductModel(id);

    if (!success) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Product not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: id }));
  } catch (err) {
    console.error('[DELETE PRODUCT ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = deleteProduct;