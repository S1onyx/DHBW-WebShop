const postCartItemModel = require('../../models/cart/postCartItemModel');

async function postCartItem(req, res, cartId, productId, quantity) {
  try {
    const result = await postCartItemModel(cartId, productId, quantity);
    
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Item added to cart successfully', itemId: result.itemId, newQuantity: result.newQuantity }));
  } catch (err) {
    if (err.message === 'Cart not found' || err.message === 'Product not found' || err.message === 'Quantity must be positive') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
}

module.exports = postCartItem;