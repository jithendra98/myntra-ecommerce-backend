const router = require('express').Router();
const {
  placeOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validatePlaceOrder,
  validateUpdateOrderStatus,
  validateMongoId,
} = require('../middleware/validate');

// All order routes require authentication
router.use(protect);

// Admin routes (must be before /:id route)
router.get('/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), validateUpdateOrderStatus, updateOrderStatus);

// User routes
router.post('/', validatePlaceOrder, placeOrder);
router.get('/', getMyOrders);
router.get('/:id', validateMongoId, getOrder);

module.exports = router;
