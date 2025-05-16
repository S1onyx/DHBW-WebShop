const db = require('../../db/database');

async function getProductByIdModel(id) {
  // Produktinformationen
  const productQuery = await db.query(
    `SELECT p.name, u.username AS seller_name, p.description, p.stock, p.price
     FROM products p
     JOIN users u ON u.id = p.seller_id
     WHERE p.id = $1`,
    [id]
  );
  if (productQuery.rows.length === 0) return null;

  // Durchschnitts-Bewertung
  const avgRatingResult = await db.query(
    `SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating
     FROM reviews
     WHERE product_id = $1`,
    [id]
  );
  const averageRating = avgRatingResult.rows[0].average_rating;

  // Bilder
  const images = await db.query(
    `SELECT url FROM product_images WHERE product_id = $1`,
    [id]
  );

  // Reviews
  const reviews = await db.query(
    `SELECT r.rating, r.comment, u.username AS name
     FROM reviews r
     JOIN users u ON u.id = r.customer_id
     WHERE r.product_id = $1`,
    [id]
  );



  return {
    ...productQuery.rows[0],
    averageRating: averageRating ?? null, // falls keine Bewertungen vorhanden sind
    images: images.rows,
    reviews: reviews.rows,
  };
}

module.exports = getProductByIdModel;