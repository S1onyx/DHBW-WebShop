const db = require('../../db/database');

async function getAllProducts({ minPrice, maxPrice, stockOnly, name, sortBy, sortOrder, categoryIds }) {
  const params = [];
  const whereClauses = [];

  if (minPrice) {
    whereClauses.push(`p.price >= $${params.length + 1}`);
    params.push(minPrice);
  }

  if (maxPrice) {
    whereClauses.push(`p.price <= $${params.length + 1}`);
    params.push(maxPrice);
  }

  if (stockOnly) {
    whereClauses.push(`p.stock > 0`);
  }

  if (name) {
    whereClauses.push(`p.name ILIKE $${params.length + 1}`);
    params.push(`%${name}%`);
  }

  if (categoryIds?.length) {
    const placeholders = categoryIds.map((_, i) => `$${params.length + i + 1}`).join(', ');
    whereClauses.push(`p.category_id IN (${placeholders})`);
    params.push(...categoryIds);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

const validSorts = {
  price: 'p.price',
  name: 'p.name',
  rating: 'average_rating'
};

const sortColumn = sortBy && validSorts[sortBy] ? validSorts[sortBy] : 'p.id';
const direction = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const query = `
    SELECT
      p.id, p.name, p.description, p.price, p.stock, p.category_id,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.id) AS review_count,
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.is_primary DESC, pi.id ASC
        LIMIT 1
      ) AS image_url
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.id
    ${where}
    GROUP BY p.id
    ORDER BY ${sortColumn} ${direction};
  `;
console.log('[GET ALL PRODUCTS] Final SQL Query:', query);
console.log('[GET ALL PRODUCTS] Params:', params);
  const result = await db.query(query, params);
  return result.rows;
}

module.exports = getAllProducts;