const putQuantityModel = require('../../models/cart/putQuantityModel');

async function putQuantity(req, res) {
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

    const { itemId, quantity } = body;

    if (!itemId || quantity == null) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'itemId and quantity are required' }));
    }

    if (quantity <= 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Quantity must be greater than 0' }));
    }

    const userId = req.user.userId; // userId aus dem Auth Kontext

    const result = await putQuantityModel(itemId, quantity, userId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Quantity updated successfully', itemId: result.itemId, newQuantity: result.newQuantity }));

  } catch (err) {
    console.error('Error updating quantity:', err);
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

module.exports = putQuantity;
