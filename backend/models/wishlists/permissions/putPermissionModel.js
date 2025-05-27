// backend/models/wishlists/permissions/putPermissionModel.js
const db = require('../../../db/database');

async function updateWishlistPermission(wishlistId, userId, permissionId) {
  try {
    const wid = parseInt(wishlistId, 10);
    const uid = parseInt(userId, 10);
    const pid = parseInt(permissionId, 10);

    if (isNaN(wid) || isNaN(uid) || isNaN(pid)) {
      return { error: 'Invalid input values', code: 400 };
    }

    // Prüfe, ob User existiert
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [uid]);
    if (userCheck.rowCount === 0) {
      return { error: 'User not found', code: 404 };
    }

    // Prüfe, ob Permission existiert
    const permissionCheck = await db.query('SELECT id FROM permission WHERE id = $1', [pid]);
    if (permissionCheck.rowCount === 0) {
      return { error: 'Permission not found', code: 404 };
    }

    // Prüfe, ob der Eintrag existiert
    const existingCheck = await db.query(
      'SELECT 1 FROM wishlist_permission WHERE wishlist_id = $1 AND user_id = $2',
      [wid, uid]
    );
    if (existingCheck.rowCount === 0) {
      return {
        error: 'User has no permission entry for this wishlist',
        code: 404,
        details: { wishlist_id: wid, user_id: uid }
      };
    }

    // Update
    await db.query(
      'UPDATE wishlist_permission SET permission = $1 WHERE wishlist_id = $2 AND user_id = $3',
      [pid, wid, uid]
    );

    return {
      data: {
        user_id: uid,
        new_permission: pid
      }
    };
  } catch (err) {
    console.error('[MODEL ERROR] Failed to update permission', err);
    return { error: 'Server error', code: 500 };
  }
}

module.exports = updateWishlistPermission;