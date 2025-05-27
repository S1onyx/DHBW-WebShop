const deleteCartItemModel = require('../../models/cart/deleteCartItemModel');

async function deleteCartItem(req, res) {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', err => reject(err));
    });

    const { itemId } = body;

    if (!itemId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'itemId is required' }));
    }

    const userId = req.user.userId;

    await deleteCartItemModel(itemId, userId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Item deleted successfully', itemId }));

  } catch (err) {
    console.error('DeleteCartItem Error:', err);
    if (err.message === 'Cart item not found') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    } else if (err.message === 'Invalid JSON') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
}

module.exports = deleteCartItem;
