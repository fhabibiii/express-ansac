/**
 * Error Handler Middleware
 * Global error handling for the application
 */

const { HTTP_STATUS } = require('../constants/app.constants');
const { errorResponse } = require('../utils/response.utils');
const { addToBlacklist } = require('./blacklist.middleware');
const telegramMonitor = require('../utils/telegram.monitor');
const { logger } = require('../utils/logger.utils');

// Track 404 errors for rate limiting purposes
const notFoundCache = {
  requests: {},
  lastCleanup: Date.now()
};

// Clean up the notFoundCache periodically
const cleanupNotFoundCache = () => {
  const now = Date.now();
  // Clean up every hour
  if (now - notFoundCache.lastCleanup > 3600000) {
    notFoundCache.requests = {};
    notFoundCache.lastCleanup = now;
    logger.info('Cleaned up 404 request cache');
  }
};

/**
 * Handles all errors in the application
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Set default values with explicit fallback to HTTP_STATUS.INTERNAL_SERVER_ERROR
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) 
    ? err.statusCode 
    : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';
  
  // Get Telegram monitor instance
  const monitor = telegramMonitor.getInstance();
  
  // Special handling for 404 errors to reduce log spam
  if (statusCode === HTTP_STATUS.NOT_FOUND) {
    const ip = req.ip || req.connection.remoteAddress;
    const path = req.originalUrl;
    const key = `${ip}:${path}`;
    
    // Clean up old entries
    cleanupNotFoundCache();
    
    // Track this request
    if (!notFoundCache.requests[key]) {
      notFoundCache.requests[key] = {
        count: 1,
        firstSeen: Date.now(),
        lastLogged: Date.now(),
        paths: { [path]: 1 }
      };
      
      // Log first occurrence of this 404 using standardized logger
      logger.warn(`Not found ${req.method} ${path}`, { 
        code: 'NOT_FOUND', 
        method: req.method, 
        path, 
        ip 
      });
    } else {
      notFoundCache.requests[key].count++;
      notFoundCache.requests[key].paths[path] = (notFoundCache.requests[key].paths[path] || 0) + 1;
      
      // Only log repeated 404s once per minute per IP+path
      const lastLogged = notFoundCache.requests[key].lastLogged;
      if (Date.now() - lastLogged > 60000) {
        logger.warn(`Repeated 404 request ${req.method} ${path}`, { 
          code: 'REPEATED_404', 
          method: req.method, 
          path, 
          ip,
          count: notFoundCache.requests[key].count,
          since: new Date(notFoundCache.requests[key].firstSeen).toISOString() 
        });
        notFoundCache.requests[key].lastLogged = Date.now();
      }
      
      // Check for suspicious 404 activity - blacklist if threshold exceeded
      const entry = notFoundCache.requests[key];
      const timePeriod = Date.now() - entry.firstSeen;
      
      // If more than 50 requests to non-existent paths in less than 2 minutes
      if (entry.count > 50 && timePeriod < 120000) {
        // Blacklist IP for 30 minutes
        addToBlacklist(ip, {
          reason: 'Excessive 404 requests',
          duration: 30 * 60 * 1000 // 30 minutes
        });
        
        // Log blacklisting
        logger.warn(`Blacklisted IP for excessive 404 requests`, {
          code: 'SECURITY_BLACKLIST',
          ip,
          reason: 'Excessive 404 requests',
          duration: '30 minutes',
          requestCount: entry.count,
          timeframe: `${Math.round(timePeriod/1000)} seconds`
        });
        
        // Notify via Telegram about suspicious activity
        if (monitor) {
          monitor.sendMessage(`⚠️ *Security Alert: Excessive 404 Requests*\nIP: ${ip}\nBlacklisted for 30 minutes\nRequests: ${entry.count} in ${Math.round(timePeriod/1000)} seconds`);
        }
        
        // Remove from notFound cache to avoid double-counting
        delete notFoundCache.requests[key];
      }
      
      // If more than 200 requests to non-existent paths in any timeframe
      else if (entry.count > 200) {
        // Blacklist IP for 2 hours
        addToBlacklist(ip, {
          reason: 'Sustained 404 spam activity',
          duration: 2 * 60 * 60 * 1000 // 2 hours
        });
        
        // Log blacklisting
        logger.warn(`Blacklisted IP for sustained 404 spam`, {
          code: 'SECURITY_BLACKLIST',
          ip,
          reason: 'Sustained 404 spam activity',
          duration: '2 hours',
          requestCount: entry.count
        });
        
        // Notify via Telegram about persistent suspicious activity
        if (monitor) {
          monitor.sendMessage(`🚨 *Security Alert: Sustained 404 Spam*\nIP: ${ip}\nBlacklisted for 2 hours\nTotal Requests: ${entry.count}`);
        }
        
        // Remove from notFound cache
        delete notFoundCache.requests[key];
      }
      
      // If trying many different non-existent paths (potential scanning attack)
      else if (Object.keys(entry.paths).length > 20) {
        // Blacklist IP for 6 hours
        addToBlacklist(ip, {
          reason: 'Path scanning activity detected',
          duration: 6 * 60 * 60 * 1000 // 6 hours
        });
        
        // Log blacklisting
        logger.warn(`Blacklisted IP for path scanning activity`, {
          code: 'SECURITY_BLACKLIST',
          ip,
          reason: 'Path scanning activity detected',
          duration: '6 hours',
          uniquePaths: Object.keys(entry.paths).length
        });
        
        // Notify via Telegram about scanning attack
        if (monitor) {
          const pathSample = Object.keys(entry.paths).slice(0, 5).join(', ') + 
            (Object.keys(entry.paths).length > 5 ? '...' : '');
          
          monitor.sendMessage(`🚨 *Security Alert: Path Scanning Detected*\nIP: ${ip}\nBlacklisted for 6 hours\nUnique Paths: ${Object.keys(entry.paths).length}\nSample paths: ${pathSample}`);
        }
        
        // Remove from notFound cache
        delete notFoundCache.requests[key];
      }
    }
    
    return res.status(statusCode).json(
      errorResponse(message, statusCode)
    );
  }
  
  // Log other errors using standardized logger
  if (statusCode >= 500) {
    logger.error(`${message} for ${req.method} ${req.url}`, { 
      error: err, 
      stack: err.stack,
      method: req.method,
      url: req.url,
      statusCode,
      ip: req.ip || req.connection.remoteAddress
    });
  } else {
    logger.warn(`${message} for ${req.method} ${req.url}`, { 
      code: statusCode,
      method: req.method,
      url: req.url, 
      message: err.message,
      ip: req.ip || req.connection.remoteAddress
    });
  }
  
  // For 5xx (server) errors, send notification via Telegram
  if (statusCode >= 500 && monitor) {
    const context = {
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress,
      user: req.user ? (req.user.id || req.user._id || 'authenticated') : 'unauthenticated'
    };
    
    // Don't include sensitive info like request body or headers
    monitor.reportError(err, context);
  }
  
  // Handle validation errors from express-validator
  if (err.errors) {
    // Always use a valid status code for validation errors
    return res.status(HTTP_STATUS.VALIDATION_ERROR).json(
      errorResponse('Validation failed', HTTP_STATUS.VALIDATION_ERROR, err.errors)
    );
  }
  
  // Handle Prisma specific errors
  if (err.code) {
    // Unique constraint error
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') || 'field';
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(`${field} already exists`, HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Foreign key constraint error
    if (err.code === 'P2003') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Related record not found', HTTP_STATUS.BAD_REQUEST)
      );
    }
    
    // Record not found
    if (err.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Record not found', HTTP_STATUS.NOT_FOUND)
      );
    }
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Invalid token', HTTP_STATUS.UNAUTHORIZED)
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Token expired', HTTP_STATUS.UNAUTHORIZED)
    );
  }
  
  // Default error response
  return res.status(statusCode).json(
    errorResponse(message, statusCode)
  );
};

module.exports = errorHandler;