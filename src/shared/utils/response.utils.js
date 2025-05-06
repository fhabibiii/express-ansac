/**
 * Response Utilities
 * Standardized response formats for API endpoints
 */

const { HTTP_STATUS } = require('../constants/app.constants');
const { logger } = require('./logger.utils');

/**
 * Create a success response object
 * @param {*} data - The data to send in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @param {boolean} includeStatusCode - Whether to include status code in response body
 * @returns {Object} Formatted success response
 */
const successResponse = (data, message = 'Success', statusCode = HTTP_STATUS.OK, includeStatusCode = true) => {
  const response = {
    status: 'success',
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (includeStatusCode) {
    response.statusCode = statusCode;
  }

  return {
    body: response,
    statusCode
  };
};

/**
 * Create an error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Additional error details
 * @param {boolean} includeStatusCode - Whether to include status code in response body
 * @returns {Object} Formatted error response
 */
const errorResponse = (message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null, includeStatusCode = true) => {
  const response = {
    status: 'error',
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  if (includeStatusCode) {
    response.statusCode = statusCode;
  }

  return {
    body: response,
    statusCode
  };
};

/**
 * Create a paginated response object
 * @param {Array} data - Array of items for the current page
 * @param {number} total - Total number of items across all pages
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
const paginatedResponse = (data, total, page, limit, message = 'Success') => {
  return successResponse(
    data,
    message, 
    HTTP_STATUS.OK,
    true,
    {
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  );
};

/**
 * Format validation errors from express-validator
 * @param {Array} validationErrors - Array of validation errors
 * @returns {Object} Formatted validation errors
 */
const formatValidationErrors = (validationErrors) => {
  const formattedErrors = {};
  
  for (const error of validationErrors) {
    formattedErrors[error.path] = error.msg;
  }
  
  return formattedErrors;
};

/**
 * Format a created response (201)
 * @param {*} data - The created resource
 * @param {string} message - Optional success message
 * @returns {Object} - Formatted response object
 */
const created = (data, message = 'Resource created successfully') => {
  return successResponse(data, message, HTTP_STATUS.CREATED);
};

/**
 * Format a no content response (204)
 * @returns {Object} - Formatted response object
 */
const noContent = () => {
  return {
    statusCode: HTTP_STATUS.NO_CONTENT,
    body: null
  };
};

/**
 * Format a bad request response (400)
 * @param {string} message - Error message
 * @param {Array|Object} errors - Optional validation errors
 * @returns {Object} - Formatted response object
 */
const badRequest = (message = 'Bad request', errors = null) => {
  return errorResponse(message, HTTP_STATUS.BAD_REQUEST, errors);
};

/**
 * Format an unauthorized response (401)
 * @param {string} message - Error message
 * @returns {Object} - Formatted response object
 */
const unauthorized = (message = 'Unauthorized') => {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Format a forbidden response (403)
 * @param {string} message - Error message
 * @returns {Object} - Formatted response object
 */
const forbidden = (message = 'Access denied') => {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Format a not found response (404)
 * @param {string} message - Error message
 * @returns {Object} - Formatted response object
 */
const notFound = (message = 'Resource not found') => {
  return errorResponse(message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Format a validation error response (422)
 * @param {Array|Object} errors - Validation errors
 * @param {string} message - Error message
 * @returns {Object} - Formatted response object
 */
const validationError = (errors, message = 'Validation error') => {
  return errorResponse(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
};

/**
 * Log response for debugging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {*} responseBody - Response body
 */
const logResponse = (req, res, responseBody) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: req.responseTime,
    userAgent: req.headers['user-agent']
  };
  
  if (process.env.NODE_ENV === 'development') {
    // In development, log more details including response body
    logData.responseBody = typeof responseBody === 'object' 
      ? responseBody 
      : { stringValue: String(responseBody).substring(0, 100) };
  }
  
  if (res.statusCode >= 500) {
    logger.error('Server error in response', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('Client error in response', logData);
  } else {
    logger.debug('Response sent successfully', logData);
  }
};

module.exports = {
  // Main response functions
  successResponse,
  errorResponse,
  paginatedResponse,
  
  // Helper functions
  formatValidationErrors,
  logResponse,
  
  // Convenience response functions (shortcuts)
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError
};