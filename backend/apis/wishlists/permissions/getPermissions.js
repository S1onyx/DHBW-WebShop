// backend/apis/wishlists/permissions/getPermissions.js
const getPermissionsForWishlist = require('../../../models/wishlists/permissions/getPermissionsModel');

async function getWishlistPermissions(req, res, wishlistId) {
  try {
    const result = await getPermissionsForWishlist(wishlistId);

    if (result === null) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Wishlist not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: result }));
  } catch (err) {
    console.error('[GET WISHLIST PERMISSIONS ERROR]', { wishlistId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getWishlistPermissions;