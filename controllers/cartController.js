const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price stock imageUrl category'
    );

    if (!cart) {
      cart = { user: req.user._id, items: [] };
    }

    // Calculate total
    let totalPrice = 0;
    if (cart.items) {
      totalPrice = cart.items.reduce((sum, item) => {
        const price = item.product ? item.product.price : 0;
        return sum + price * item.quantity;
      }, 0);
    }

    res.status(200).json({
      success: true,
      data: {
        ...cart.toObject ? cart.toObject() : cart,
        totalPrice: Math.round(totalPrice * 100) / 100,
        itemCount: cart.items ? cart.items.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // Check stock
    if (product.stock < quantity) {
      return next(
        new ApiError(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
          400
        )
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if already exists
      const newQty = cart.items[existingItemIndex].quantity + quantity;

      if (newQty > product.stock) {
        return next(
          new ApiError(
            `Cannot add more. Total would be ${newQty}, but only ${product.stock} in stock`,
            400
          )
        );
      }

      cart.items[existingItemIndex].quantity = newQty;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate for response
    await cart.populate('items.product', 'name price stock imageUrl category');

    res.status(200).json({
      success: true,
      message: existingItemIndex > -1 ? 'Cart item quantity updated' : 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return next(new ApiError('Item not found in cart', 404));
    }

    // Check stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      return next(new ApiError('Product no longer exists', 404));
    }

    if (quantity > product.stock) {
      return next(
        new ApiError(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
          400
        )
      );
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate('items.product', 'name price stock imageUrl category');

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return next(new ApiError('Item not found in cart', 404));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate('items.product', 'name price stock imageUrl category');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty',
        data: { user: req.user._id, items: [] },
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
