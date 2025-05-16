const db = require('../../db/database');

async function getProductByIdModel(id) {
  const productQuery = await db.query(
    `SELECT p.name, u.first_name || ' ' || u.last_name AS seller_name, p.description, p.stock
    FROM products p
    JOIN users u
    ON u.id = p.seller_id
    WHERE p.id = $1`,
    [id]
  );
  if (productQuery.rows.length === 0) return null;

  const images = await db.query(
    `SELECT url FROM product_images WHERE product_id = $1`,
    [id]
  );

  const reviews = await db.query(
    `SELECT r.rating, r.comment, u.first_name || ' ' || u.last_name AS name
     FROM reviews r
     JOIN users u
     ON u.id = r.customer_id
     WHERE r.product_id = $1
    `,
    [id]
  );

  return {
    ...productQuery.rows[0],
    images: images.rows,
    reviews: reviews.rows,
  };
}

module.exports = getProductByIdModel;