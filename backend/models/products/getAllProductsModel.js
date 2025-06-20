const db = require('../../db/database');

async function getAllProducts({ minPrice, maxPrice, stockOnly, name, sortBy, sortOrder, categoryIds, limit, offset }) {
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

  const mainQuery = `
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
    ORDER BY ${sortColumn} ${direction}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2};
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) AS total
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.id
    ${where};
  `;

  const rowsResult = await db.query(mainQuery, [...params, limit, offset]);
  const countResult = await db.query(countQuery, params);

  return {
    rows: rowsResult.rows,
    totalCount: parseInt(countResult.rows[0].total, 10)
  };
}

module.exports = getAllProducts;