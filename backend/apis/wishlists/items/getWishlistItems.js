// backend/apis/wishlists/items/getWishlistItems.js
const getWishlistItemsModel = require('../../../models/wishlists/items/getWishlistItemsModel');

async function getWishlistItems(req, res, wishlistId) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Authentication required', code: 401 }));
    }

    const result = await getWishlistItemsModel(wishlistId, userId);

    if (result.notFound) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Wishlist not found', code: 404 }));
    }

    if (result.forbidden) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Access denied to this wishlist', code: 403 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: result }));
  } catch (err) {
    console.error('[GET WISHLIST ITEMS ERROR]', { wishlistId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during wishlist fetch', code: 500 }));
  }
}

module.exports = getWishlistItems;