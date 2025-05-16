const deleteProductModel = require('../../models/products/deleteProductModel');

async function deleteProduct(req, res, params) {
    try {
        const id = parseInt(params.get('id'), 10);
        if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid product ID' }));
        }

        const success = await deleteProductModel(id);

        if (!success) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Product not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

module.exports = deleteProduct;
