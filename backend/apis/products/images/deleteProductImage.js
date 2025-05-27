// backend/apis/products/deleteProductImage.js
const deleteProductImageModel = require('../../../models/products/images/deleteProductImageModel');
const db = require('../../../db/database');

async function deleteProductImage(req, res, imageId) {
  try {
    const result = await db.query(
      `SELECT product_id FROM product_images WHERE id = $1`,
      [imageId]
    );

    if (result.rowCount === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Image not found', code: 404 }));
    }

    const productId = result.rows[0].product_id;

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM product_images WHERE product_id = $1`,
      [productId]
    );

    if (countResult.rows[0].count <= 1) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Cannot delete last image of a product', code: 400 }));
    }

    const deleted = await deleteProductImageModel(imageId);

    if (!deleted) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Image not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: imageId }));
  } catch (err) {
    console.error('[DELETE PRODUCT IMAGE ERROR]', { imageId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during image deletion', code: 500 }));
  }
}

module.exports = deleteProductImage;