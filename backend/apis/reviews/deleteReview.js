const deleteReviewModel = require('../../models/reviews/deleteReviewModel');

async function deleteReview(req, res, reviewId) {
  try {
    const result = await deleteReviewModel(reviewId);
    if (!result) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Review not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Review deleted', data: result }));
  } catch (err) {
    console.error('[DELETE REVIEW ERROR]', { reviewId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Server error during review deletion', code: 500 }));
  }
}

module.exports = deleteReview;