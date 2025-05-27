const { putWishlistModel } = require('../../../models/wishlists/wishlist/putWishlistModel');

async function putWishlist(req, res) {
  try {
    // ID aus req.url extrahieren, da req.params nicht gesetzt ist
    const match = req.url.match(/^\/api\/wishlists\/wishlist\/(\d+)$/);
    const wishlistId = match ? match[1] : null;
    const userId = req.user?.userId;

    // Prüfen ob Wishlist-ID vorhanden ist
    if (!wishlistId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Wishlist ID is required in URL params.' }));
    }

    // Prüfen ob Wishlist-ID gültig ist (z.B. keine negative oder ungültige Zahl)
    const parsedId = parseInt(wishlistId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid Wishlist ID. Must be a positive integer.' }));
    }

    if (!userId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Authentication required.' }));
    }

    // Body lesen
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', err => reject(err));
    });

    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Wishlist name is required and must be a non-empty string.' }));
    }

    const updatedWishlist = await putWishlistModel(parsedId, userId, name.trim());

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(updatedWishlist));

  } catch (err) {
    console.error('putWishlist Error:', err);

    if (err.message === 'Invalid JSON') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON in request body.' }));
    }

    if (err.message === 'Wishlist not found') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Wishlist not found or does not belong to user.' }));
    }

    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = putWishlist;
