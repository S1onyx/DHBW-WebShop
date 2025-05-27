// backend/apis/wishlists/permissions/deletePermission.js
const deletePermissionFromWishlist = require('../../../models/wishlists/permissions/deletePermissionModel');

async function deleteWishlistPermission(req, res, wishlistId) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { user_id } = data;

      if (!user_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Missing user_id', code: 400 }));
      }

      const result = await deletePermissionFromWishlist(wishlistId, user_id);

      if (result.error) {
        res.writeHead(result.code, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: result.error, code: result.code, ...(result.details ? { details: result.details } : {}) }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Permission removed',
        data: result.data
      }));
    } catch (err) {
      console.error('[DELETE WISHLIST PERMISSION ERROR]', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid JSON body', code: 400 }));
    }
  });
}

module.exports = deleteWishlistPermission;