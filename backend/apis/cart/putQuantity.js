// controllers/cart/putCartItemQuantity.js
const putCartItemQuantityModel = require('../../models/cart/putQuantityModel');

async function putCartItemQuantity(req, res, cartId, productId, newQuantity) {
  try {
    const result = await putCartItemQuantityModel(cartId, productId, newQuantity);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Quantity updated successfully', newQuantity: result.newQuantity }));
  } catch (err) {
    if (
      err.message === 'Cart not found' ||
      err.message === 'Cart item not found' ||
      err.message === 'Quantity must be at least 1'
    ) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
}

module.exports = putCartItemQuantity;
