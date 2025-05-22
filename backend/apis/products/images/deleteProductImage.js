const deleteProductImageModel = require('../../../models/products/images/deleteProductImageModel');

async function deleteProductImage(req, res, imageId) {
  try {
    const result = await deleteProductImageModel(imageId);

    if (!result) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Image not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: imageId }));
  } catch (err) {
    console.error('[DELETE PRODUCT IMAGE ERROR]', { imageId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during image deletion', code: 500 }));
  }
}

module.exports = deleteProductImage;