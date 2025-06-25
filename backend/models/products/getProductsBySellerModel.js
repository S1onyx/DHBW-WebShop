const db = require('../../db/database');

async function getProductsBySellerModel(sellerId) {
  const productsQuery = await db.query(
    `SELECT p.id, p.name, p.description, p.stock, p.price, c.name AS category
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.seller_id = $1
     ORDER BY p.id`,
    [sellerId]
  );

  const products = [];

  for (const product of productsQuery.rows) {
    const [imagesRes, reviewsRes, ratingRes] = await Promise.all([
      db.query('SELECT url, alt_text, is_primary FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, id', [product.id]),
      db.query(`SELECT r.rating, r.comment, u.username AS name
                FROM reviews r
                JOIN users u ON u.id = r.customer_id
                WHERE r.product_id = $1`, [product.id]),
      db.query('SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating FROM reviews WHERE product_id = $1', [product.id])
    ]);

    products.push({
      ...product,
      averageRating: ratingRes.rows[0].average_rating ?? null,
      images: imagesRes.rows,
      reviews: reviewsRes.rows
    });
  }

  return products;
}

module.exports = getProductsBySellerModel;