const { getCartModel } = require('../../models/cart/getCartModel');

async function getCart(req, res) {
  try {
    const userId = req.user.userId;

    const cartData = await getCartModel(userId); // Übergib nur userId

    if (!cartData) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No cart found for this user' }));
    }

    const totalPrice = cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const response = {
      cartDetails: cartData.cartDetails,
      items: cartData.items,
      totalPrice,
    };

    if (cartData.items.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ...response, message: 'The cart is empty' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (err) {
    console.error('GetCart Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = getCart;
