const db = require('../../../db/database');

async function postProductImageModel(productId, file, altText, isPrimary) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Prüfe, ob das Produkt existiert
    const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Falls als primary markiert, alte primary zurücksetzen
    if (isPrimary === 'true') {
      await client.query(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = $1',
        [productId]
      );
    }

    const isPrimaryBool = isPrimary === 'true';

    const result = await client.query(`
      INSERT INTO product_images (product_id, url, alt_text, is_primary)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      productId,
      `/uploads/products/${file.filename}`,
      altText || null,
      isPrimaryBool
    ]);

    // Wenn nicht explizit primary gesetzt, aber noch kein primary existiert
    if (!isPrimaryBool) {
      const hasPrimary = await client.query(
        'SELECT 1 FROM product_images WHERE product_id = $1 AND is_primary = TRUE',
        [productId]
      );

      if (hasPrimary.rowCount === 0) {
        await client.query(
          'UPDATE product_images SET is_primary = TRUE WHERE id = $1',
          [result.rows[0].id]
        );
        result.rows[0].is_primary = true;
      }
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = postProductImageModel;