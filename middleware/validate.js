const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Process validation results
 * If validation errors exist, returns 400 with error details
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
  next();
};

// ─── Auth Validations ────────────────────────────────────────────

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// ─── Product Validations ─────────────────────────────────────────

const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Men', 'Women', 'Kids', 'Beauty', 'Home', 'Electronics', 'Sports', 'Accessories'])
    .withMessage('Invalid category'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  handleValidationErrors,
];

const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .isIn(['Men', 'Women', 'Kids', 'Beauty', 'Home', 'Electronics', 'Sports', 'Accessories'])
    .withMessage('Invalid category'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  handleValidationErrors,
];

// ─── Cart Validations ────────────────────────────────────────────

const validateAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  handleValidationErrors,
];

const validateUpdateCartItem = [
  param('itemId').isMongoId().withMessage('Invalid cart item ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  handleValidationErrors,
];

// ─── Order Validations ───────────────────────────────────────────

const validatePlaceOrder = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isString()
    .withMessage('Payment ID must be a string'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zip').notEmpty().withMessage('ZIP code is required'),
  handleValidationErrors,
];

const validateUpdateOrderStatus = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Shipped', 'Delivered'])
    .withMessage('Status must be Pending, Shipped, or Delivered'),
  handleValidationErrors,
];

// ─── Common Validations ─────────────────────────────────────────

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateProductUpdate,
  validateAddToCart,
  validateUpdateCartItem,
  validatePlaceOrder,
  validateUpdateOrderStatus,
  validateMongoId,
};
