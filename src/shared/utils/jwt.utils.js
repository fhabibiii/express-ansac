/**
 * JWT Utilities
 * Functions for JWT token generation and verification
 */

const jwt = require('jsonwebtoken');
const config = require('../../config/app.config');

/**
 * Generate a JWT token for a user
 * 
 * @param {Object} payload - Data to be encoded in the token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * Generate refresh token with longer expiration
 * 
 * @param {Object} payload - Data to be encoded in the token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn });
};

/**
 * Verify a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Extract token from request header
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null if not found
 */
const extractTokenFromHeader = (req) => {
  if (!req.headers.authorization) {
    return null;
  }

  const parts = req.headers.authorization.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  extractTokenFromHeader
};