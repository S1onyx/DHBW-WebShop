// backend/models/wishlists/items/getWishlistItemsModel.js
const db = require('../../../db/database');

async function getWishlistItemsModel(wishlistId, userId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const wishlistRes = await client.query(
      `SELECT w.id, w.name, w.customer_id, u.username AS owner_username
       FROM wishlists w
       JOIN users u ON u.id = w.customer_id
       WHERE w.id = $1`,
      [wishlistId]
    );

    if (wishlistRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return { notFound: true };
    }

    const wishlist = wishlistRes.rows[0];

    let access = null;
    if (wishlist.customer_id === userId) {
      access = 'owner';
    } else {
      const permRes = await client.query(
        `SELECT p.permission
         FROM wishlist_permission wp
         JOIN permission p ON p.id = wp.permission
         WHERE wp.wishlist_id = $1 AND wp.user_id = $2`,
        [wishlistId, userId]
      );

      const roles = permRes.rows.map(r => r.permission);
      if (roles.includes('write')) access = 'write';
      else if (roles.includes('readOnly')) access = 'readOnly';
    }

    if (!access) {
      await client.query('ROLLBACK');
      return { forbidden: true };
    }

    const itemsRes = await client.query(
      `SELECT
         p.id AS product_id,
         p.name,
         p.description,
         c.name AS category,
         p.price,
         wi.quantity,
         (
           SELECT url
           FROM product_images
           WHERE product_id = p.id AND is_primary = TRUE
           LIMIT 1
         ) AS primary_image
       FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE wi.wishlist_id = $1`,
      [wishlistId]
    );

    const items = itemsRes.rows;

    const totalPrice = items.reduce((sum, item) =>
      sum + (parseFloat(item.price) * item.quantity), 0);

    await client.query('COMMIT');

    return {
      wishlist_id: wishlist.id,
      wishlist_name: wishlist.name,
      owner_username: wishlist.owner_username,
      access,
      total_price: parseFloat(totalPrice.toFixed(2)),
      items
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = getWishlistItemsModel;