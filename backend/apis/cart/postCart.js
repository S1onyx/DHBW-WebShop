const postCartModel = require('../../models/cart/postCartModel');

async function postCart(req, res, userId) {
  try {
    const result = await postCartModel(userId);

    if (!result) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'User not found' }));
    }

    if (result.cartExists) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Cart already exists for this user', cartId: result.cartId }));
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Cart created successfully', cartId: result.cartId }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = postCart;