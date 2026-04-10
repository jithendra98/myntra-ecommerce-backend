const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [200, 'Product name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      trim: true,
      enum: {
        values: [
          'Men',
          'Women',
          'Kids',
          'Beauty',
          'Home',
          'Electronics',
          'Sports',
          'Accessories',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/300x400?text=No+Image',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
productSchema.index({ category: 1, price: 1 });   // Filtered listing queries
productSchema.index({ name: 'text' });              // Full-text search
productSchema.index({ price: 1 });                  // Price range queries
productSchema.index({ createdAt: -1 });             // Latest products

module.exports = mongoose.model('Product', productSchema);
