const postCartItemModel = require('../../models/cart/postCartItemModel');
const postCartModel = require('../../models/cart/postCartModel'); // Für neuen Warenkorb erstellen
const getCartModel = require('../../models/cart/getCartModel'); // Für Warenkorb abrufen

async function postCartItem(req, res) {
  try {
    // Body auslesen
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(JSON.parse(data)));
      req.on('error', err => reject(err));
    });

    const { productId, quantity } = body;

    if (!productId || !quantity) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'productId and quantity required' }));
    }

    const userId = req.user.userId;

    // Warenkorb vom User holen
    let cartData = await getCartModel.byUserId(userId);

    let cartId;
    if (!cartData) {
      // Wenn kein Warenkorb existiert, neuen erstellen
      const result = await postCartModel(userId);
      cartId = result.cartId;
    } else {
      cartId = cartData.cartDetails.id;
    }

    // Artikel ins Model packen
    const result = await postCartItemModel(cartId, productId, quantity);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Item added to cart successfully',
      itemId: result.itemId,
      newQuantity: result.newQuantity,
    }));

  } catch (err) {
    console.error('Error:', err);
    if (['Cart not found', 'Product not found', 'Quantity must be positive'].includes(err.message)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
}

module.exports = postCartItem;
