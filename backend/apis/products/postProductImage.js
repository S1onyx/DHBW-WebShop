const path = require('path');
const fs = require('fs');
const multer = require('multer');
const postProductImageModel = require('../../models/products/postProductImageModel');

const uploadDir = path.join(__dirname, '../../uploads/products');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG files are allowed'));
    }
    cb(null, true);
  }
}).single('image');

async function postProductImage(req, res, productId) {
  upload(req, res, async function (err) {
    if (err) {
      console.error('[MULTER ERROR]', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message, code: 400 }));
    }

    if (!req.file) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'No image uploaded', code: 400 }));
    }

    const { alt_text, is_primary } = req.body;

    try {
      const result = await postProductImageModel(productId, req.file, alt_text, is_primary);

      if (!result) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Product not found', code: 404 }));
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
    } catch (err) {
      console.error('[POST PRODUCT IMAGE ERROR]', {
        productId,
        file: req.file?.filename,
        error: err
      });

      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during image upload', code: 500 }));
    }
  });
}

module.exports = postProductImage;