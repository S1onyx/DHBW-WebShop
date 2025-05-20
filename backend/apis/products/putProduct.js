// backend/apis/products/putProduct.js
const putProductModel = require('../../models/products/putProductModel');

async function putProduct(req, res, id) {
  try {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      if (!body) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Request body is empty' }));
      }

      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      }

      const allowedFields = ['name', 'description', 'price', 'stock'];
      const updates = {};

      for (const key of allowedFields) {
        if (data[key] !== undefined) updates[key] = data[key];
      }

      if (Object.keys(updates).length === 0) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'No valid fields provided for update' }));
      }

      if (updates.price !== undefined && updates.price < 0) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Price must be >= 0' }));
      }

      if (updates.stock !== undefined && updates.stock < 0) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Stock must be >= 0' }));
      }

      const success = await putProductModel(id, updates);

      if (!success) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Product not found' }));
      }

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Product updated successfully' }));
    });
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = putProduct;