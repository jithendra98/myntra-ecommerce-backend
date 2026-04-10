const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * General API rate limiter
 * Applies to all routes
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/**
 * Auth rate limiter (stricter)
 * Prevents brute-force login/register attempts
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

module.exports = { generalLimiter, authLimiter };
