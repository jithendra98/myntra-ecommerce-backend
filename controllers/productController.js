const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const { generateCacheKey, getCache, setCache, invalidateCache } = require('../utils/cache');
const config = require('../config/config');

/**
 * @desc    Get all products with pagination & filtering
 * @route   GET /api/products
 * @access  Public
 * @query   page, limit, category, minPrice, maxPrice, sort
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      sort = '-createdAt',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Try cache first
    const cacheKey = generateCacheKey('products:list', req.query);
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Count total matching documents
    const total = await Product.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    // Fetch products
    const products = await Product.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const response = {
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages,
      data: products,
    };

    // Cache the response
    await setCache(cacheKey, response, config.redisTTL);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search products by name (full-text)
 * @route   GET /api/products/search?q=shirt
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return next(new ApiError('Search query (q) is required', 400));
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Try cache
    const cacheKey = generateCacheKey('products:search', { q, page, limit });
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const filter = { $text: { $search: q } };

    const total = await Product.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    // Sort by text relevance score
    const products = await Product.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const response = {
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages,
      data: products,
    };

    await setCache(cacheKey, response, config.redisTTL);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    // Try cache
    const cacheKey = `products:detail:${req.params.id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    const response = {
      success: true,
      data: product,
    };

    await setCache(cacheKey, response, config.redisTTL);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    // Invalidate product list cache
    await invalidateCache('products:*');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // Invalidate caches
    await invalidateCache('products:*');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // Invalidate caches
    await invalidateCache('products:*');

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
