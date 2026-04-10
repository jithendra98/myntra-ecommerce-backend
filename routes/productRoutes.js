const router = require('express').Router();
const {
  getProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateProduct, validateProductUpdate, validateMongoId } = require('../middleware/validate');

// Public routes
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', validateMongoId, getProduct);

// Admin-only routes
router.post('/', protect, authorize('admin'), validateProduct, createProduct);
router.put('/:id', protect, authorize('admin'), validateMongoId, validateProductUpdate, updateProduct);
router.delete('/:id', protect, authorize('admin'), validateMongoId, deleteProduct);

module.exports = router;
