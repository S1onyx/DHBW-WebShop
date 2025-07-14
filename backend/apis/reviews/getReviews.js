const getReviewsModel = require('../../models/reviews/getReviewsModel');
const db = require('../../db/database');

async function getReviews(req, res, productId) {
  try {
    const productCheck = await db.query('SELECT 1 FROM products WHERE id = $1', [productId]);
    if (productCheck.rowCount === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Product not found',
        code: 404
      }));
    }

    const reviews = await getReviewsModel(productId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: reviews,
      message: reviews.length === 0 ? 'No reviews available yet' : undefined
    }));
  } catch (err) {
    console.error('[GET REVIEWS ERROR]', { productId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Server error during review retrieval',
      code: 500
    }));
  }
}

module.exports = getReviews;