// backend/apis/orders/postOrder.js
const postOrderModel = require('../../models/orders/postOrderModel');

async function postOrder(req, res) {
  const userId = req.user.userId;

  try {
    const result = await postOrderModel(userId);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: result }));
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || 'Server error during order creation';
    const response = {
      success: false,
      error: message,
      code: status,
    };

    if (err.details) {
      response.details = err.details;
    }

    console.error('[POST ORDER ERROR]', { userId, error: err });

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  }
}

module.exports = postOrder;