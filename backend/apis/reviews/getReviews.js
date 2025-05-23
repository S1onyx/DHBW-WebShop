const getReviewsModel = require('../../models/reviews/getReviewsModel');

async function getReviews(req, res, productId) {
  try {
    const reviews = await getReviewsModel(productId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: reviews }));
  } catch (err) {
    console.error('[GET REVIEWS ERROR]', { productId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during review retrieval', code: 500 }));
  }
}

module.exports = getReviews;