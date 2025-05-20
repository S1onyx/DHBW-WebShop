// controllers/cart/deleteCart.js
const deleteCartModel = require('../../models/cart/deleteCartModel');

async function deleteCart(req, res, cartId) {
  try {
    const result = await deleteCartModel(cartId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Cart deleted successfully' }));
  } catch (err) {
    if (err.message === 'Cart not found') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
}

module.exports = deleteCart;
