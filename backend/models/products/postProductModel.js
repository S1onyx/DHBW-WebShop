const db = require('../../db/database');

async function postProductModel({ name, description, price, stock, category_id, imageFile, seller_id, user }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    let finalSellerId;
    if (user.roleId === 1) {
      if (!seller_id) {
        throw { message: 'Admin must provide seller_id', code: 400 };
      }
      const check = await client.query('SELECT id FROM users WHERE id = $1 AND role_id = 2', [seller_id]);
      if (check.rowCount === 0) {
        throw { message: 'Provided seller_id is not a valid seller', code: 400 };
      }
      finalSellerId = seller_id;
    } else if (user.roleId === 2) {
      finalSellerId = user.userId;
    } else {
      throw { message: 'Only Admins and Sellers may create products', code: 403 };
    }

    if (category_id) {
      const catCheck = await client.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (catCheck.rowCount === 0) {
        throw { message: 'Invalid category_id', code: 400 };
      }
    }

    const productResult = await client.query(
      `INSERT INTO products (seller_id, name, description, category_id, price, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [finalSellerId, name, description, category_id, price, stock]
    );

    const productId = productResult.rows[0].id;

    const imageUrl = `/uploads/products/${imageFile.filename}`;

    await client.query(
      `INSERT INTO product_images (product_id, url, alt_text, is_primary)
       VALUES ($1, $2, $3, TRUE)`,
      [productId, imageUrl, name]
    );

    await client.query('COMMIT');
    return { id: productId, name, description, price, stock, category_id, imageUrl };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = postProductModel;
