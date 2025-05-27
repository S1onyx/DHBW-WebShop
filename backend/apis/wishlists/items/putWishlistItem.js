// backend/apis/wishlists/items/putWishlistItem.js
const putWishlistItemModel = require('../../../models/wishlists/items/putWishlistItemModel');

async function putWishlistItem(req, res, wishlistId) {
  const userId = req.user?.userId;
  if (!userId) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Authentication required', code: 401 }));
  }

  let body = '';
  let bodySize = 0;
  const MAX_BODY_SIZE = 1e6;

  req.on('data', chunk => {
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Payload too large', code: 413 }));
    }
    body += chunk;
  });

  req.on('end', async () => {
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Request body is empty', code: 400 }));
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const { product_id, quantity } = data;
    if (!product_id || isNaN(quantity) || quantity < 1) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Valid product_id and quantity >= 1 are required', code: 400 }));
    }

    try {
      const result = await putWishlistItemModel(wishlistId, userId, product_id, quantity);

      if (result.notFound) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Wishlist or item not found', code: 404 }));
      }

      if (result.forbidden) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Access denied to this wishlist', code: 403 }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Quantity updated', ...result }));
    } catch (err) {
      console.error('[PUT WISHLIST ITEM ERROR]', { wishlistId, product_id, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Server error during wishlist update', code: 500 }));
    }
  });
}

module.exports = putWishlistItem;