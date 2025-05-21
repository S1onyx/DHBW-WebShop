// backend/apis/products/getAllProducts.js
const getAllProductsModel = require('../../models/products/getAllProductsModel');

async function getAllProducts(req, res, params) {
  try {
    const filters = {
      minPrice: params.get('minPrice'),
      maxPrice: params.get('maxPrice'),
      name: params.get('name'),
      inStock: params.get('inStock') === 'true',
      sort: params.get('sort'),
      order: params.get('order'),
    };

    const products = await getAllProductsModel(filters);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: products }));
  } catch (err) {
    console.error('[GET ALL PRODUCTS ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getAllProducts;