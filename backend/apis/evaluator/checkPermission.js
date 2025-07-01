// backend/apis/evaluator/checkPermission.js
const db = require('../../db/database');

async function checkPermission(req, res) {
  const userId = parseInt(req.query.get('user_id'), 10);
  const resourceType = req.query.get('resource_type');
  const resourceId = parseInt(req.query.get('resource_id'), 10);
  const access = req.query.get('access');

  if (!userId || !resourceType || isNaN(resourceId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Missing or invalid parameters', code: 400 }));
  }

  try {
    let allowed = false;

    if (resourceType === 'product') {
      const result = await db.query(
        `SELECT seller_id FROM products WHERE id = $1`,
        [resourceId]
      );

      if (result.rowCount > 0) {
        const sellerId = result.rows[0].seller_id;
        allowed = (userId === sellerId);
      }

    } else if (resourceType === 'wishlist') {
      if (!access || !['read', 'write'].includes(access)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Missing or invalid access type', code: 400 }));
      }

      const ownerResult = await db.query(
        `SELECT customer_id FROM wishlists WHERE id = $1`,
        [resourceId]
      );

      if (ownerResult.rowCount > 0) {
        const ownerId = ownerResult.rows[0].customer_id;
        if (userId === ownerId) {
          allowed = true;
        } else {
          const permResult = await db.query(
            `SELECT permission FROM wishlist_permission WHERE wishlist_id = $1 AND user_id = $2`,
            [resourceId, userId]
          );

          if (permResult.rowCount > 0) {
            const permission = permResult.rows[0].permission;
            allowed = access === 'read'
              ? (permission === 1 || permission === 2)
              : (permission === 2);
          }
        }
      }

    } else if (resourceType === 'user') {
  if (userId === resourceId) {
    allowed = true;
  } else {
    const result = await db.query(
      `SELECT role_id FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rowCount > 0) {
      const roleId = result.rows[0].role_id;
      allowed = (roleId === 1);
    }
  }
} else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Unknown resource type', code: 400 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, allowed }));
  } catch (err) {
    console.error('[CHECK PERMISSION ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during permission evaluation', code: 500 }));
  }
}

module.exports = checkPermission;