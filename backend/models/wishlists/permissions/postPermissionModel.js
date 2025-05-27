// backend/models/wishlists/permissions/postPermissionModel.js
const db = require('../../../db/database');

async function postPermissionToWishlist(wishlistId, userId, permissionId) {
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

    // Prüfe, ob Eintrag bereits existiert
    const existsCheck = await db.query(
      'SELECT 1 FROM wishlist_permission WHERE wishlist_id = $1 AND user_id = $2',
      [wid, uid]
    );
    if (existsCheck.rowCount > 0) {
      return {
        error: 'User already has permission for this wishlist',
        code: 409,
        details: { wishlist_id: wid, user_id: uid }
      };
    }

    // Einfügen
    await db.query(
      `INSERT INTO wishlist_permission (wishlist_id, user_id, permission)
       VALUES ($1, $2, $3)`,
      [wid, uid, pid]
    );

    return {
      data: {
        user_id: uid,
        permission: pid
      }
    };
  } catch (err) {
    console.error('[MODEL ERROR] Failed to insert permission', err);
    return { error: 'Server error', code: 500 };
  }
}

module.exports = postPermissionToWishlist;