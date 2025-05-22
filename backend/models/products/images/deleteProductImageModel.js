// backend/models/products/deleteProductImageModel.js
const db = require('../../../db/database');
const fs = require('fs');
const path = require('path');

async function deleteProductImageModel(imageId) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const imageResult = await client.query(
      `SELECT id, product_id, url, is_primary FROM product_images WHERE id = $1`,
      [imageId]
    );

    if (imageResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const { product_id, url, is_primary } = imageResult.rows[0];

    await client.query(`DELETE FROM product_images WHERE id = $1`, [imageId]);

    if (is_primary) {
      const nextImageResult = await client.query(
        `SELECT id FROM product_images WHERE product_id = $1 LIMIT 1`,
        [product_id]
      );

      if (nextImageResult.rowCount > 0) {
        await client.query(
          `UPDATE product_images SET is_primary = TRUE WHERE id = $1`,
          [nextImageResult.rows[0].id]
        );
      }
    }

    const filePath = path.join(__dirname, '../../', url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = deleteProductImageModel;