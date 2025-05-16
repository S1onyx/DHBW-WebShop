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
    res.end(JSON.stringify(products));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = getAllProducts;