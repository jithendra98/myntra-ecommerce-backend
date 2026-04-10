const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Place order from cart
 * @route   POST /api/orders
 * @access  Private
 */
const placeOrder = async (req, res, next) => {
  try {
    const { paymentId, shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return next(
        new ApiError('Cannot place order — your cart is empty', 400)
      );
    }

    // Validate stock and build order items
    const orderItems = [];
    let totalPrice = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
        return next(
          new ApiError(
            `A product in your cart no longer exists. Please review your cart.`,
            400
          )
        );
      }

      if (product.stock < cartItem.quantity) {
        return next(
          new ApiError(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, In cart: ${cartItem.quantity}`,
            400
          )
        );
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });

      totalPrice += product.price * cartItem.quantity;
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
      paymentId,
      shippingAddress,
      status: 'Pending',
    });

    // Decrement stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = { user: req.user._id };
    const total = await Order.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (owner or admin)
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // Only allow owner or admin to view
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError('Not authorized to view this order', 403));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // Validate status flow: Pending → Shipped → Delivered
    const statusFlow = { Pending: 'Shipped', Shipped: 'Delivered' };

    if (order.status === 'Delivered') {
      return next(new ApiError('Order already delivered, cannot change status', 400));
    }

    if (statusFlow[order.status] !== status && status !== order.status) {
      return next(
        new ApiError(
          `Invalid status transition. Current: "${order.status}", Expected next: "${statusFlow[order.status]}"`,
          400
        )
      );
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/all
 * @access  Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders };
