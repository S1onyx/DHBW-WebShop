// backend/apis/products/putProduct.js
const putProductModel = require('../../models/products/putProductModel');

async function putProduct(req, res, id) {
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
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const allowedFields = ['name', 'description', 'price', 'stock'];
    const updates = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined) updates[key] = data[key];
    }

    if (Object.keys(updates).length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'No valid fields provided for update', code: 400 }));
    }

    if (updates.price !== undefined && updates.price < 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Price must be >= 0', code: 400 }));
    }

    if (updates.stock !== undefined && updates.stock < 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Stock must be >= 0', code: 400 }));
    }

    try {
      const success = await putProductModel(id, updates);

      if (!success) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Product not found', code: 404 }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Product updated successfully' }));
    } catch (err) {
      console.error('[PUT PRODUCT ERROR]', { id, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
    }
  });
}

module.exports = putProduct;