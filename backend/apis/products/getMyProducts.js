const getProductsBySellerModel = require('../../models/products/getProductsBySellerModel');

async function getMyProducts(req, res) {
  try {
    const sellerId = req.user.userId;
    const products = await getProductsBySellerModel(sellerId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: products }));
  } catch (err) {
    console.error('[GET MY PRODUCTS ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error while fetching seller products', code: 500 }));
  }
}

module.exports = getMyProducts;