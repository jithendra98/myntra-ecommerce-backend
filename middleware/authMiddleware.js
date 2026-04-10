const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Protect routes - Verify JWT token
 * Extracts token from Authorization header (Bearer <token>)
 * Attaches user object to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError('Not authorized, no token provided', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError('Not authorized, user not found', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Not authorized, invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Not authorized, token expired', 401));
    }
    return next(new ApiError('Not authorized', 401));
  }
};

/**
 * Authorize by role
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
