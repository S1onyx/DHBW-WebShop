// backend/models/products/putProductImageModel.js
const db = require('../../../db/database');

async function putProductImageModel(imageId, { alt_text, is_primary }) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const imageResult = await client.query(
      `SELECT id, product_id FROM product_images WHERE id = $1`,
      [imageId]
    );

    if (imageResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const productId = imageResult.rows[0].product_id;

    if (is_primary === true || is_primary === 'true') {
      await client.query(
        `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1`,
        [productId]
      );
    }

    const updateResult = await client.query(
      `UPDATE product_images
       SET alt_text = COALESCE($1, alt_text),
           is_primary = COALESCE($2::boolean, is_primary)
       WHERE id = $3
       RETURNING id, product_id, url, alt_text, is_primary`,
      [alt_text ?? null, is_primary ?? null, imageId]
    );

    await client.query('COMMIT');
    return updateResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = putProductImageModel;