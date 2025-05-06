/**
 * Redis Cache Service
 * Provides advanced caching capabilities using Redis
 */

const { createClient } = require('redis');
const { logger } = require('../shared/utils/logger.utils');
const config = require('../config/app.config');

// Default cache options
const DEFAULT_TTL = 60 * 5; // 5 minutes in seconds

// Create Redis client with configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Stop retrying after 3 attempts
      if (retries >= 3) {
        logger.warn('Redis connection failed after 3 attempts. Caching will be disabled.');
        return false; // Stop retrying
      }
      // Exponential backoff strategy: 1s, 2s, 4s
      return Math.min(retries * 1000, 3000);
    },
    connectTimeout: 5000 // 5 seconds timeout for connection attempts
  }
});

// Connection state tracking
let isRedisAvailable = false;

// Connection event handlers
client.on('error', (err) => {
  if (isRedisAvailable) {
    logger.error('Redis client error:', err);
  } else {
    // Only log warning if it's the first connection attempt
    logger.warn('Redis unavailable. Caching features will be disabled.');
  }
  isRedisAvailable = false;
});

client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('ready', () => {
  logger.info('Redis client ready');
  isRedisAvailable = true;
});

/**
 * Initialize Redis connection
 * @returns {Promise<void>}
 */
const initialize = async () => {
  try {
    if (!client.isOpen) {
      await client.connect().catch(error => {
        logger.warn('Redis connection failed. Running without caching.', error.message);
        // We don't rethrow - application will continue without Redis
      });
    }
  } catch (error) {
    logger.warn('Failed to connect to Redis. Application will run without caching.', error.message);
    // Allow application to continue without Redis
  }
};

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
const get = async (key) => {
  try {
    if (!isRedisAvailable || !client.isOpen) return null;
    
    const value = await client.get(`ansac:${key}`);
    if (!value) return null;
    
    return JSON.parse(value);
  } catch (error) {
    logger.debug(`Redis get error for key [${key}]:`, error);
    return null;
  }
};

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<boolean>} Success status
 */
const set = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    if (!isRedisAvailable || !client.isOpen) return false;
    
    await client.set(`ansac:${key}`, JSON.stringify(value), {
      EX: ttl
    });
    return true;
  } catch (error) {
    logger.debug(`Redis set error for key [${key}]:`, error);
    return false;
  }
};

/**
 * Delete a value from the cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
const del = async (key) => {
  try {
    if (!isRedisAvailable || !client.isOpen) return false;
    
    await client.del(`ansac:${key}`);
    return true;
  } catch (error) {
    logger.error(`Redis delete error for key [${key}]:`, error);
    return false;
  }
};

/**
 * Clear all cached data with a specific prefix
 * @param {string} prefix - Key prefix to clear
 * @returns {Promise<boolean>} Success status
 */
const clearByPrefix = async (prefix) => {
  try {
    if (!isRedisAvailable || !client.isOpen) return false;
    
    // Get all keys matching the pattern
    const keys = await client.keys(`ansac:${prefix}*`);
    
    if (keys.length === 0) return true;
    
    // Delete all matching keys
    await client.del(keys);
    logger.info(`Cleared ${keys.length} cache entries with prefix [${prefix}]`);
    return true;
  } catch (error) {
    logger.error(`Redis clearByPrefix error for prefix [${prefix}]:`, error);
    return false;
  }
};

/**
 * Redis middleware for Express route caching
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration = DEFAULT_TTL) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!isRedisAvailable || !client.isOpen) {
      return next();
    }
    
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create a cache key from the request URL
    const key = `route:${req.originalUrl}`;
    
    try {
      // Try to get cached response
      const cachedResponse = await get(key);
      
      if (cachedResponse) {
        // Return cached response
        return res.status(200)
          .set('X-Cache', 'HIT')
          .json(cachedResponse);
      }
      
      // If no cached response, intercept res.json to cache the response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          set(key, data, duration)
            .catch(err => logger.debug('Failed to cache response:', err));
        }
        
        // Set cache status header
        res.set('X-Cache', 'MISS');
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.debug('Cache middleware error:', error);
      next();
    }
  };
};

// Initialize the Redis connection when this module is imported
// But don't block the application if Redis is unavailable
initialize().catch(() => {
  logger.warn('Redis initialization failed. Application will continue without caching.');
});

module.exports = {
  get,
  set,
  del,
  clearByPrefix,
  cacheMiddleware,
  client,
  DEFAULT_TTL,
  isRedisAvailable: () => isRedisAvailable // Export function to check Redis availability
};