/**
 * Validation Middleware
 * Provides centralized request validation using express-validator
 */

const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants/app.constants');

/**
 * Validate request using express-validator rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format validation errors
  const extractedErrors = errors.array().map(err => {
    if (err.type === 'field') {
      return { [err.path]: err.msg };
    }
    return { [err.type]: err.msg };
  });
  
  // Create custom validation error
  const error = new Error('Validation failed');
  error.statusCode = HTTP_STATUS.VALIDATION_ERROR;
  error.errors = extractedErrors;
  
  next(error);
};

module.exports = {
  validate
};