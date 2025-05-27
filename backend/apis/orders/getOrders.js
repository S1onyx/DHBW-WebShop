const getOrdersModel = require('../../models/orders/getOrdersModel');

async function getOrders(req, res) {
  try {
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    const productId = req.query.get('product_id');
    const statusRaw = req.query.get('status');

    const status = statusRaw ? parseInt(statusRaw, 10) : null;
    if (statusRaw && (isNaN(status) || status <= 0)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid status ID', code: 400 }));
    }

    if (roleId === 1 && !productId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Missing product_id for admin request', code: 400 }));
    }

    const result = await getOrdersModel({ userId, roleId, productId, status });

    if (result.rows.length === 0) {
      if (result.filteredOut) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Keine Bestellungen mit dem angegebenen Status gefunden',
          code: 404,
          data: []
        }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        data: [],
        message: 'Noch keine Bestellungen vorhanden'
      }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: result.rows }));
  } catch (err) {
    if (err.message === 'INVALID_STATUS') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid status ID', code: 400 }));
    }

    console.error('[GET ORDERS ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error while fetching orders', code: 500 }));
  }
}

module.exports = getOrders;