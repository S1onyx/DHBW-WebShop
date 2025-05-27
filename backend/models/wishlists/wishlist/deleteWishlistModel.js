const db = require('../../../db/database');

async function deleteWishlistModel(wishlist_id, user_id) {
    const checkQuery = `
    SELECT
      CASE
        WHEN w.customer_id = $2 THEN 0
        ELSE p.permission
      END AS permission_id
    FROM wishlists w
    LEFT JOIN wishlist_permission p ON p.wishlist_id = w.id AND p.user_id = $2
    WHERE w.id = $1
  `;
    const checkResult = await db.query(checkQuery, [wishlist_id, user_id]);

    if (checkResult.rowCount === 0) {
        return { status: 404, error: 'Wishlist not found' };
    }

    const { permission_id } = checkResult.rows[0];
    if (permission_id !== 0 && permission_id !== 1) {
        return { status: 403, error: 'Unauthorized: insufficient permissions' };
    }


    const deleteQuery = 'DELETE FROM wishlists WHERE id = $1';
    await db.query(deleteQuery, [wishlist_id]);

    return { status: 200, message: 'Wishlist deleted successfully' };
}

module.exports = deleteWishlistModel;
