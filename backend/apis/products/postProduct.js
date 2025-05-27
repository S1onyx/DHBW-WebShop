const path = require('path');
const fs = require('fs');
const multer = require('multer');
const postProductModel = require('../../models/products/postProductModel');

const uploadDir = path.join(__dirname, '../../uploads/products');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: function (_req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG files are allowed'));
    }
    cb(null, true);
  }
}).single('image');

async function postProduct(req, res) {
  upload(req, res, async function (err) {
    if (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message, code: 400 }));
    }

    const { name, description, price, stock, category_id, seller_id } = req.body;

    if (!req.file) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Image is required', code: 400 }));
    }

    if (!name || !description || price == null || stock == null) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Missing required fields', code: 400 }));
    }

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock);
    if (isNaN(numericPrice) || numericPrice < 0 || isNaN(numericStock) || numericStock < 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid price or stock', code: 400 }));
    }

    try {
      const result = await postProductModel({
        name,
        description,
        price: numericPrice,
        stock: numericStock,
        category_id: category_id || null,
        imageFile: req.file,
        seller_id,
        user: req.user
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Product created', data: result }));
    } catch (err) {
      console.error('[POST PRODUCT ERROR]', err);
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      const status = err.code || 500;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message || 'Server error', code: status }));
    }
  });
}

module.exports = postProduct;