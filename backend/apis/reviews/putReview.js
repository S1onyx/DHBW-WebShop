// backend/apis/reviews/putReview.js
const putReviewModel = require('../../models/reviews/putReviewModel');

async function putReview(req, res, reviewId) {
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

    const updates = {};
    const ignoredFields = [];

    // Inline rating validierung
    if (data.rating !== undefined) {
      const num = Number(data.rating);
      const isValidRating = !isNaN(num) && num >= 0 && num <= 5 && num * 2 === Math.floor(num * 2);
      if (!isValidRating) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Rating must be between 0 and 5 in 0.5 steps',
          code: 400
        }));
      }
      updates.rating = num;
    }

    if (data.comment !== undefined) {
      if (typeof data.comment !== 'string' || data.comment.trim() === '') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Comment must be a non-empty string',
          code: 400
        }));
      }
      updates.comment = data.comment.trim();
    }

    for (const key of Object.keys(data)) {
      if (!['rating', 'comment'].includes(key)) {
        ignoredFields.push(key);
      }
    }

    if (Object.keys(updates).length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'No valid fields provided. Only "rating" and "comment" are allowed.',
        ignoredFields,
        code: 400
      }));
    }

    try {
      const updated = await putReviewModel(reviewId, updates);
      if (!updated) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Review not found or not allowed',
          code: 404
        }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Review updated',
        updatedFields: Object.keys(updates),
        ignoredFields
      }));
    } catch (err) {
      console.error('[PUT REVIEW ERROR]', { reviewId, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during review update', code: 500 }));
    }
  });
}

module.exports = putReview;