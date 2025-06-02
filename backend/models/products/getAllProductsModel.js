const db = require('../../db/database');

async function getAllProducts({ minPrice, maxPrice, stockOnly, name, sortBy, sortOrder, categoryId }) {
  const params = [];
  let whereClauses = [];

  if (minPrice) {
    whereClauses.push('p.price >= ?');
    params.push(minPrice);
  }
  if (maxPrice) {
    whereClauses.push('p.price <= ?');
    params.push(maxPrice);
  }
  if (stockOnly) {
    whereClauses.push('p.stock > 0');
  }
  if (name) {
    whereClauses.push('p.name ILIKE ?');
    params.push(`%${name}%`);
  }
  if (categoryId) {
    whereClauses.push('p.category_id IN (SELECT id FROM get_all_subcategories(?))');
    params.push(categoryId);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const validSorts = ['price', 'name'];
  const sortColumn = validSorts.includes(sortBy) ? sortBy : 'p.id';
  const direction = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.stock, p.category_id,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.id) AS review_count,
      (
        SELECT pi.image_url
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

  const [rows] = await db.query(query, params);
  return rows;
}

module.exports = getAllProducts;