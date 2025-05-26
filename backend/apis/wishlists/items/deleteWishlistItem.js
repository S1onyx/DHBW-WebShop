// backend/apis/wishlists/items/deleteWishlistItem.js
const deleteWishlistItemModel = require('../../../models/wishlists/items/deleteWishlistItemModel');

async function deleteWishlistItem(req, res, wishlistId) {
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

    const { product_id } = data;
    if (!product_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'product_id is required', code: 400 }));
    }

    try {
      const result = await deleteWishlistItemModel(wishlistId, userId, product_id);

      if (result.notFound) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Wishlist or item not found', code: 404 }));
      }

      if (result.forbidden) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Access denied to this wishlist', code: 403 }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, ...result }));
    } catch (err) {
      console.error('[DELETE WISHLIST ITEM ERROR]', { wishlistId, product_id, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Server error during wishlist deletion', code: 500 }));
    }
  });
}

module.exports = deleteWishlistItem;