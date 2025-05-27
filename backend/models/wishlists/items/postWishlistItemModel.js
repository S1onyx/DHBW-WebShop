// backend/models/wishlists/items/postWishlistItemModel.js
const db = require('../../../db/database');

async function postWishlistItemModel(wishlistId, userId, productId, quantity) {
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

    const productRes = await client.query(
      `SELECT id FROM products WHERE id = $1`,
      [productId]
    );
    if (productRes.rowCount === 0) return { productNotFound: true };

    const existing = await client.query(
      `SELECT quantity FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2`,
      [wishlistId, productId]
    );

    let finalQuantity = quantity;

    if (existing.rowCount > 0) {
      finalQuantity += existing.rows[0].quantity;
      await client.query(
        `UPDATE wishlist_items SET quantity = $1 WHERE wishlist_id = $2 AND product_id = $3`,
        [finalQuantity, wishlistId, productId]
      );
    } else {
      await client.query(
        `INSERT INTO wishlist_items (wishlist_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [wishlistId, productId, quantity]
      );
    }

    await client.query('COMMIT');
    return {
      wishlist_id: wishlistId,
      product_id: productId,
      quantity: finalQuantity
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = postWishlistItemModel;