const db = require('../../db/database');

async function getAllProductsModel(filters) {
  let query = `SELECT
  p.name AS product_name,
  c.name AS category_name,
  p.price,
  (
    SELECT url
    FROM product_images
    WHERE product_id = p.id
    AND is_primary = TRUE
  ) AS image_url
FROM products p
JOIN categories c ON p.category_id = c.id`;
  const params = [];

  const validSortFields = {
  price: 'p.price',
  name: 'p.name',
};

  if (filters.minPrice) {
    params.push(filters.minPrice);
    query += ` AND p.price >= $${params.length}`;
  }
  if (filters.maxPrice) {
    params.push(filters.maxPrice);
    query += ` AND p.price <= $${params.length}`;
  }
  if (filters.inStock) {
    query += ' AND p.stock > 0';
  }
  if (filters.name) {
  params.push(`%${filters.name}%`);
  query += ` AND (p.name ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
  }

if (filters.sort && validSortFields[filters.sort]) {
  const order = filters.order === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${validSortFields[filters.sort]} ${order}`;
}

  const result = await db.query(query, params);
  return result.rows;
}

module.exports = getAllProductsModel;