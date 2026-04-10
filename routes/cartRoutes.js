const router = require('express').Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validateAddToCart, validateUpdateCartItem } = require('../middleware/validate');

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', validateAddToCart, addToCart);
router.put('/:itemId', validateUpdateCartItem, updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
