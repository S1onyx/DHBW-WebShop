const db = require('../db/database');

/**
 * Middleware-Factory:
 * Erlaubt Zugriff, wenn der eingeloggte User Seller eines Produkts ist, das zur Bestellung gehört.
 */
function requireInvolvedSeller() {
  return function (handler) {
    return async (req, res) => {
      const userId = req.user?.userId;

      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Authentication required',
          code: 401
        }));
      }

      const orderId = parseInt(req.params[0], 10);
      if (isNaN(orderId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Invalid order ID in URL',
          code: 400
        }));
      }

      try {
        const result = await db.query(
          `SELECT 1
           FROM order_items oi
           JOIN products p ON p.id = oi.product_id
           WHERE oi.order_id = $1 AND p.seller_id = $2
           LIMIT 1`,
          [orderId, userId]
        );

        if (result.rowCount === 0) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            error: 'Access denied – you are not involved in this order',
            code: 403
          }));
        }

        return handler(req, res);
      } catch (err) {
        console.error('[REQUIRE INVOLVED SELLER ERROR]', {
          userId,
          orderId,
          error: err
        });

        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Server error during seller verification',
          code: 500
        }));
      }
    };
  };
}

module.exports = requireInvolvedSeller;