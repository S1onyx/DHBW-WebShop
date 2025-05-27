const putOrderModel = require('../../models/orders/putOrderModel');

async function putOrder(req, res, orderIdRaw) {
  const orderId = parseInt(orderIdRaw, 10);
  if (isNaN(orderId) || orderId <= 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: false,
      error: 'Invalid order ID',
      code: 400
    }));
  }

  let body = '';
  let bodySize = 0;
  const MAX_BODY_SIZE = 1e6;

  req.on('data', chunk => {
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Payload too large',
        code: 413
      }));
    }
    body += chunk;
  });

  req.on('end', async () => {
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Request body is empty',
        code: 400
      }));
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Invalid JSON format',
        code: 400
      }));
    }

    const statusId = parseInt(data.status_id, 10);
    if (!statusId || isNaN(statusId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Missing or invalid status_id',
        code: 400
      }));
    }

    try {
      const result = await putOrderModel(orderId, statusId);

      if (result === 'ORDER_NOT_FOUND') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Order not found',
          code: 404
        }));
      }

      if (result === 'INVALID_STATUS') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Invalid status_id – does not exist in order_status table',
          code: 400
        }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order_id: orderId,
          new_status_id: statusId
        }
      }));
    } catch (err) {
      console.error('[PUT ORDER ERROR]', { orderId, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Server error during status update',
        code: 500
      }));
    }
  });
}

module.exports = putOrder;