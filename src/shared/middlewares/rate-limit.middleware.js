/**
 * Custom Rate Limiting Middleware
 * Provides granular rate limiting for different routes
 */

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger.utils');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Konfigurasi dasar rate limiter
const createRateLimiter = (options) => {
  // In development mode, use a pass-through middleware instead of actual rate limiting
  if (isDevelopment) {
    return (req, res, next) => next();
  }

  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // Default: 15 menit
    max: 100, // Default: 100 request per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later',
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        userAgent: req.headers['user-agent']
      });
      
      res.status(options.statusCode).json({
        success: false,
        message: options.message,
        error: {
          code: 429,
          reason: 'Rate limit exceeded',
          retryAfter: Math.ceil(options.windowMs / 1000 / 60) // minutes
        }
      });
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// Rate limiter untuk seluruh API
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // 100 request per 15 menit
});

// Rate limiter yang lebih ketat untuk endpoint otentikasi
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // 10 request per 15 menit
  message: 'Too many authentication attempts, please try again later'
});

// Rate limiter khusus untuk login
const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5, // 5 request per jam
  message: 'Too many login attempts, please try again after an hour'
});

// Rate limiter untuk register
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // 3 request per jam
  message: 'Too many registration attempts, please try again after an hour'
});

// Rate limiter untuk password reset
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // 3 request per jam
  message: 'Too many password reset attempts, please try again after an hour'
});

// Rate limiter untuk upload file
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 20, // 20 uploads per jam
  message: 'Too many upload attempts, please try again later'
});

// Rate limiter untuk rute admin
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 30, // 30 request per 15 menit
  message: 'Too many admin requests, please try again later'
});

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  adminLimiter
};