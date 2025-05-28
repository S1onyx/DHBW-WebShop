const express = require('express');
const router = express.Router();

const getAllProducts = require('../apis/products/getAllProducts');
const getProductById = require('../apis/products/getProductById');
const postProduct = require('../apis/products/postProduct');
const putProduct = require('../apis/products/putProduct');
const deleteProduct = require('../apis/products/deleteProduct');

const withAuth = require('../middleware/withAuth');
const requireRole = require('../middleware/requireRole');
const requireValidatedUser = require('../middleware/requireValidatedUser');
const requireOwnership = require('../middleware/requireOwnership');

const getProductOwner = async (req) => {
  const db = require('../db');
  const result = await db.query('SELECT seller_id FROM products WHERE id = $1', [req.params.id]);
  return result.rowCount ? result.rows[0].seller_id : null;
};

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', withAuth, requireValidatedUser, requireRole(2, 1), postProduct);
router.put('/:id', withAuth, requireValidatedUser, requireOwnership(getProductOwner), putProduct);
router.delete('/:id', withAuth, requireValidatedUser, requireOwnership(getProductOwner), deleteProduct);

module.exports = router;