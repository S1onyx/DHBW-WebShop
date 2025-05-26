// backend/apis/users/putUser.js
const putUserModel = require('../../models/users/putUserModel');

async function putUser(req, res, id) {
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

    const allowedFields = ['first_name', 'last_name', 'street', 'house_number', 'postal_code', 'city', 'country'];
    const updates = {};
    const ignoredFields = [];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        if (typeof value !== 'string' || value.trim() === '') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: `Invalid value for '${key}'`, code: 400 }));
        }
        updates[key] = value.trim();
      } else {
        ignoredFields.push(key);
      }
    }

    if (Object.keys(updates).length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'No valid fields provided for update', code: 400, ignoredFields }));
    }

    try {
      const success = await putUserModel(id, updates);
      if (!success) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'User updated', updatedFields: Object.keys(updates), ignoredFields }));
    } catch (err) {
      console.error('[PUT USER ERROR]', { id, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
    }
  });
}

module.exports = putUser;