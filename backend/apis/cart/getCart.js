const getCartModel = require('../../models/cart/getCartModel');

async function getCart(req, res, cartId) {
  try {
    const cartData = await getCartModel(cartId);

    if (!cartData) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Cart not found' }));
    }

    // Berechnung des Gesamtpreises
    const totalPrice = cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Hinzufügen des Gesamtpreisfeldes
    const response = {
      cartDetails: cartData.cartDetails,
      items: cartData.items,
      totalPrice: totalPrice
    };

    if (cartData.items.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ...response, message: 'The cart is empty' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cartId = url.pathname.split('/').pop();
  getCart(req, res, cartId);
};