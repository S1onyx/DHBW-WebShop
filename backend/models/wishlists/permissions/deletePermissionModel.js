// backend/models/wishlists/permissions/deletePermissionModel.js
const db = require('../../../db/database');

async function deletePermissionFromWishlist(wishlistId, userId) {
  try {
    const wid = parseInt(wishlistId, 10);
    const uid = parseInt(userId, 10);

    if (isNaN(wid) || isNaN(uid)) {
      return { error: 'Invalid input values', code: 400 };
    }

    // Prüfe ob User existiert
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [uid]);
    if (userCheck.rowCount === 0) {
      return { error: 'User not found', code: 404 };
    }

    // Prüfe ob Owner selbst
    const ownerCheck = await db.query('SELECT customer_id FROM wishlists WHERE id = $1', [wid]);
    if (ownerCheck.rowCount === 0) {
      return { error: 'Wishlist not found', code: 404 };
    }
    if (ownerCheck.rows[0].customer_id === uid) {
      return { error: 'Cannot remove owner permission', code: 403 };
    }

    // Prüfe ob Eintrag existiert
    const permissionCheck = await db.query(
      'SELECT 1 FROM wishlist_permission WHERE wishlist_id = $1 AND user_id = $2',
      [wid, uid]
    );
    if (permissionCheck.rowCount === 0) {
      return {
        error: 'Permission entry not found',
        code: 404,
        details: { wishlist_id: wid, user_id: uid }
      };
    }

    // Löschen
    await db.query(
      'DELETE FROM wishlist_permission WHERE wishlist_id = $1 AND user_id = $2',
      [wid, uid]
    );

    return {
      data: {
        user_id: uid
      }
    };
  } catch (err) {
    console.error('[MODEL ERROR] Failed to delete permission', err);
    return { error: 'Server error', code: 500 };
  }
}

module.exports = deletePermissionFromWishlist;