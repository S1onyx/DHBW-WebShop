// backend/apis/wishlists/permissions/postPermission.js
const postPermissionToWishlist = require('../../../models/wishlists/permissions/postPermissionModel');

async function postWishlistPermission(req, res, wishlistId) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { user_id, permission_id } = data;

      if (!user_id || !permission_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Missing user_id or permission_id', code: 400 }));
      }

      const result = await postPermissionToWishlist(wishlistId, user_id, permission_id);

      if (result.error) {
        res.writeHead(result.code, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: result.error, code: result.code, ...(result.details ? { details: result.details } : {}) }));
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'User added to wishlist with permission',
        data: result.data
      }));
    } catch (err) {
      console.error('[POST WISHLIST PERMISSION ERROR]', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid JSON body', code: 400 }));
    }
  });
}

module.exports = postWishlistPermission;