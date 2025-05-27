// backend/models/wishlists/items/deleteWishlistItemModel.js
const db = require('../../../db/database');

async function deleteWishlistItemModel(wishlistId, userId, productId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const wishlistRes = await client.query(
      `SELECT customer_id FROM wishlists WHERE id = $1`,
      [wishlistId]
    );
    if (wishlistRes.rowCount === 0) return { notFound: true };

    const ownerId = wishlistRes.rows[0].customer_id;
    let access = null;

    if (ownerId === userId) {
      access = 'owner';
    } else {
      const permRes = await client.query(
        `SELECT p.permission
         FROM wishlist_permission wp
         JOIN permission p ON p.id = wp.permission
         WHERE wp.wishlist_id = $1 AND wp.user_id = $2`,
        [wishlistId, userId]
      );
      const permissions = permRes.rows.map(r => r.permission);
      if (permissions.includes('write')) access = 'write';
      else if (permissions.includes('readOnly')) access = 'readOnly';
    }

    if (!access || access === 'readOnly') return { forbidden: true };

    const itemRes = await client.query(
      `SELECT id FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2`,
      [wishlistId, productId]
    );
    if (itemRes.rowCount === 0) return { notFound: true };

    await client.query(
      `DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2`,
      [wishlistId, productId]
    );

    await client.query('COMMIT');
    return {
      wishlist_id: wishlistId,
      product_id: productId
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = deleteWishlistItemModel;