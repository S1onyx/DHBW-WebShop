const db = require('../../../db/database');

async function postPermissionToWishlist(wishlistId, identifier, permissionId) {
  try {
    const wid = parseInt(wishlistId, 10);
    const pid = parseInt(permissionId, 10);

    if (isNaN(wid) || isNaN(pid)) {
      return { error: 'Invalid wishlist or permission ID', code: 400 };
    }

    // User finden anhand von id, username oder email
    let userResult;
    if (!isNaN(parseInt(identifier))) {
      // numerisch → ID
      userResult = await db.query('SELECT id FROM users WHERE id = $1', [parseInt(identifier, 10)]);
    } else if (identifier.includes('@')) {
      // email
      userResult = await db.query('SELECT id FROM users WHERE email = $1', [identifier]);
    } else {
      // username
      userResult = await db.query('SELECT id FROM users WHERE username = $1', [identifier]);
    }

    if (userResult.rowCount === 0) {
      return { error: 'User not found', code: 404 };
    }

    const uid = userResult.rows[0].id;

    // Permission prüfen
    const permissionCheck = await db.query('SELECT id FROM permission WHERE id = $1', [pid]);
    if (permissionCheck.rowCount === 0) {
      return { error: 'Permission not found', code: 404 };
    }

    // Wishlist und Owner prüfen
    const ownerCheck = await db.query('SELECT customer_id FROM wishlists WHERE id = $1', [wid]);
    if (ownerCheck.rowCount === 0) {
      return { error: 'Wishlist not found', code: 404 };
    }
    if (ownerCheck.rows[0].customer_id === uid) {
      return {
        error: 'Owner cannot be added as a permission',
        code: 400
      };
    }

    // Duplikat prüfen
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