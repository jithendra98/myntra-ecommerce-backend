const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Shipped', 'Delivered'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'Pending',
    },
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required'],
    },
    shippingAddress: {
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      zip: { type: String, required: [true, 'ZIP code is required'] },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });   // User's order history
orderSchema.index({ status: 1 });                  // Filter by status
orderSchema.index({ paymentId: 1 });               // Payment lookup

module.exports = mongoose.model('Order', orderSchema);
