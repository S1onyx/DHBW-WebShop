const postReviewModel = require('../../models/reviews/postReviewModel');
const db = require('../../db/database');

async function postReview(req, res, productId) {
  let body = '';
  let bodySize = 0;
  const MAX_BODY_SIZE = 1e6;

  req.on('data', chunk => {
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Payload too large', code: 413 }));
    }
    body += chunk;
  });

  req.on('end', async () => {
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Request body is empty', code: 400 }));
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const { rating, comment } = data;

    if (typeof comment !== 'string' || comment.trim() === '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Comment is required', code: 400 }));
    }

    const validRatings = new Set([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
    if (!validRatings.has(rating)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid rating value', code: 400 }));
    }

    try {
      const productExists = await db.query('SELECT 1 FROM products WHERE id = $1', [productId]);
      if (productExists.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Product not found', code: 404 }));
      }

      const created = await postReviewModel(req.user.userId, productId, rating, comment);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Review created', data: created }));
    } catch (err) {
      if (err.code === '23505') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Review already exists', code: 409 }));
      }

      console.error('[POST REVIEW ERROR]', { userId: req.user?.userId, productId, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during review creation', code: 500 }));
    }
  });
}

module.exports = postReview;