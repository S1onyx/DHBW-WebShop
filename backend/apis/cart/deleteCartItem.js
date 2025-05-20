const deleteCartItemModel = require('../../models/cart/deleteCartItemModel');

async function deleteCartItem(req, res, cartId, productId) {
  try {
    const result = await deleteCartItemModel(cartId, productId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        message: 'Item removed from cart successfully', 
        productId: productId
    }));
  } catch (err) {
    if (err.message === 'Cart item not found' || err.message === 'Cart not found') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
}

module.exports = deleteCartItem;