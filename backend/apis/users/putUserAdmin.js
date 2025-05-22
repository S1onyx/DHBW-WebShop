// backend/apis/users/putUserAdmin.js
const putUserAdminModel = require('../../models/users/putUserAdminModel');
const bcrypt = require('bcrypt');

async function putUserAdmin(req, res, id) {
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

    if (data.password) {
      try {
        data.password_hash = await bcrypt.hash(data.password, 10);
        delete data.password;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Password hashing failed', code: 500 }));
      }
    }

    const forbiddenFields = ['verification_token', 'reset_token', 'reset_expires', 'created_at'];
    const updates = {};
    const ignoredFields = [];

    for (const [key, value] of Object.entries(data)) {
      if (!forbiddenFields.includes(key)) {
        updates[key] = value;
      } else {
        ignoredFields.push(key);
      }
    }

    if (Object.keys(updates).length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'No valid fields provided', code: 400, ignoredFields }));
    }

    try {
      const success = await putUserAdminModel(id, updates);
      if (!success) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'User updated', updatedFields: Object.keys(updates), ignoredFields }));
    } catch (err) {
      console.error('[PUT USER ADMIN ERROR]', { id, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
    }
  });
}

module.exports = putUserAdmin;