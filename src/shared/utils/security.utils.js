/**
 * Security Utils
 * Additional security utilities for application hardening
 */

const crypto = require('crypto');
const { logger } = require('./logger.utils');

/**
 * Generates a strong cryptographically secure random token
 * @param {number} length - Length of the token
 * @returns {string} Secure random token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Performs constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} Whether the strings are equal
 */
const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b.padEnd(a.length, '\0').slice(0, a.length), 'utf8')
  );
};

/**
 * Creates a hash of a value with a provided salt or a random one
 * @param {string} value - Value to hash
 * @param {string} [salt] - Optional salt, will be generated if not provided
 * @returns {Object} Object containing hash and salt
 */
const hashValue = (value, salt = null) => {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(value, useSalt, 10000, 64, 'sha512');
  
  return {
    hash: derivedKey.toString('hex'),
    salt: useSalt
  };
};

/**
 * Verify a value against a stored hash and salt
 * @param {string} value - Value to verify
 * @param {string} hash - Stored hash
 * @param {string} salt - Salt used for the hash
 * @returns {boolean} Whether the value matches the hash
 */
const verifyHash = (value, hash, salt) => {
  try {
    const derivedKey = crypto.pbkdf2Sync(value, salt, 10000, 64, 'sha512');
    return secureCompare(derivedKey.toString('hex'), hash);
  } catch (error) {
    logger.error('Hash verification failed:', error);
    return false;
  }
};

/**
 * Sanitizes an object by removing sensitive fields
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} sensitiveFields - Fields to remove
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, sensitiveFields = ['password', 'token', 'secret']) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

/**
 * Checks if a password meets complexity requirements
 * @param {string} password - Password to check
 * @returns {Object} Result of password validation
 */
const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') {
    return { 
      valid: false, 
      message: 'Password must be a string' 
    };
  }
  
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  
  const valid = Object.values(checks).every(Boolean);
  
  return {
    valid,
    checks,
    message: valid ? 
      'Password meets all requirements' : 
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and special characters'
  };
};

/**
 * Implements CSRF token generation and validation
 */
const csrf = {
  /**
   * Generate a new CSRF token
   * @returns {string} CSRF token
   */
  generateToken: () => {
    return generateSecureToken(32);
  },
  
  /**
   * Validate a CSRF token against the expected token
   * @param {string} token - Token to validate
   * @param {string} expectedToken - Expected token value
   * @returns {boolean} Whether the token is valid
   */
  validateToken: (token, expectedToken) => {
    try {
      return secureCompare(token, expectedToken);
    } catch (error) {
      logger.error('CSRF token validation failed:', error);
      return false;
    }
  }
};

module.exports = {
  generateSecureToken,
  secureCompare,
  hashValue,
  verifyHash,
  sanitizeObject,
  validatePasswordStrength,
  csrf
};