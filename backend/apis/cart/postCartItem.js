const postCartItemModel = require('../../models/cart/postCartItemModel');

async function postCartItem(req, res, cartId, productId, quantity) {
  try {
    const result = await postCartItemModel(cartId, productId, quantity);

    if (result.itemExists) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Item already exists in the cart', itemId: result.itemId }));
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Item added to cart successfully', itemId: result.itemId }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = postCartItem;