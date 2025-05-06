/**
 * Database Utilities
 * Helper functions for database operations with circuit breaker protection
 */

const prisma = require('../../config/database.config');
const { PAGINATION } = require('../constants/app.constants');
const { databaseCircuitBreaker } = require('./circuit-breaker.utils');
const { logger } = require('./logger.utils');

/**
 * Apply pagination to a Prisma query
 * @param {Object} queryOptions - Prisma query options
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 * @returns {Object} Query options with pagination
 */
const applyPagination = (queryOptions = {}, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
  // Ensure limit doesn't exceed maximum
  const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
  
  // Calculate skip value for pagination
  const skip = (page - 1) * safeLimit;
  
  return {
    ...queryOptions,
    skip,
    take: safeLimit
  };
};

/**
 * Format paginated results with metadata
 * @param {Array} data - Query results
 * @param {number} total - Total record count
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @returns {Object} Formatted paginated response
 */
const formatPaginatedResults = (data, total, page, limit) => {
  const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
  const totalPages = Math.ceil(total / safeLimit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit: safeLimit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Execute a paginated query with count and circuit breaker protection
 * @param {string} model - Prisma model name
 * @param {Object} queryOptions - Query options
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 * @returns {Promise<Object>} Paginated results with metadata
 */
const paginatedQuery = async (model, queryOptions = {}, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
  return executeWithCircuitBreaker(async () => {
    // Get the model from prisma
    const prismaModel = prisma[model];
    if (!prismaModel) {
      throw new Error(`Invalid model: ${model}`);
    }
    
    // Extract where condition for count
    const { where } = queryOptions;
    
    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prismaModel.findMany(applyPagination(queryOptions, page, limit)),
      prismaModel.count({ where })
    ]);
    
    return formatPaginatedResults(data, total, page, limit);
  }, `${model}.paginatedQuery`);
};

/**
 * Create a custom error object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Custom error object
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Execute a database operation with circuit breaker protection
 * @param {Function} operation - Database operation to execute
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise<any>} Result of the database operation
 */
const executeWithCircuitBreaker = async (operation, operationName = 'database operation') => {
  try {
    return await databaseCircuitBreaker.execute(operation);
  } catch (error) {
    // Check if error is from circuit breaker
    if (error.circuitBreaker) {
      logger.error(`Circuit breaker prevented ${operationName}: ${error.message}`);
      
      // Throw a user-friendly error
      const friendlyError = createError('Database service temporarily unavailable, please try again later', 503);
      friendlyError.originalError = error;
      throw friendlyError;
    }
    
    // Handle Prisma specific errors
    if (error.code) {
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          logger.error(`Unique constraint violation in ${operationName}:`, error);
          throw createError(
            `Duplicate entry for ${error.meta?.target?.join(', ')}`,
            400
          );
        
        case 'P2003': // Foreign key constraint
          logger.error(`Foreign key constraint violation in ${operationName}:`, error);
          throw createError(
            'Related record not found',
            400
          );
        
        case 'P2025': // Record not found
          logger.error(`Record not found in ${operationName}:`, error);
          throw createError(
            'Record not found',
            404
          );
          
        case 'P2018': // Required relation missing
          logger.error(`Required relation missing in ${operationName}:`, error);
          throw createError(
            'Required relation missing',
            400
          );
      }
    }
    
    // Regular database error
    logger.error(`Database error in ${operationName}:`, error);
    throw error;
  }
};

/**
 * Check if a record exists in the database with circuit breaker protection
 * @param {String} model - The Prisma model name (e.g., 'user', 'blog')
 * @param {Object} where - Prisma where clause
 * @returns {Promise<boolean>} - True if exists, false otherwise
 */
const safeExists = async (model, where) => {
  return executeWithCircuitBreaker(
    async () => {
      const count = await prisma[model].count({ where });
      return count > 0;
    },
    `${model}.exists`
  );
};

/**
 * Find a record by ID with circuit breaker protection
 * @param {String} model - The Prisma model name
 * @param {Number|String} id - The record ID
 * @param {Object} options - Additional options (select, include)
 * @returns {Promise<Object|null>} - The found record or null
 */
const safeFindById = async (model, id, options = {}) => {
  return executeWithCircuitBreaker(
    async () => {
      return await prisma[model].findUnique({
        where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
        ...options
      });
    },
    `${model}.findById`
  );
};

/**
 * Safe version of prisma find operations with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - Find options
 * @returns {Promise<any>} Find operation result
 */
const safeFind = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].findMany(options),
    `${model}.findMany`
  );
};

/**
 * Safe version of prisma findUnique operation with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - FindUnique options
 * @returns {Promise<any>} FindUnique operation result
 */
const safeFindUnique = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].findUnique(options),
    `${model}.findUnique`
  );
};

/**
 * Safe version of prisma findFirst operation with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - FindFirst options
 * @returns {Promise<any>} FindFirst operation result
 */
const safeFindFirst = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].findFirst(options),
    `${model}.findFirst`
  );
};

/**
 * Safe version of prisma create operation with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - Create options
 * @returns {Promise<any>} Create operation result
 */
const safeCreate = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].create(options),
    `${model}.create`
  );
};

/**
 * Safe version of prisma update operation with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - Update options
 * @returns {Promise<any>} Update operation result
 */
const safeUpdate = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].update(options),
    `${model}.update`
  );
};

/**
 * Safe version of prisma delete operation with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - Delete options
 * @returns {Promise<any>} Delete operation result
 */
const safeDelete = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].delete(options),
    `${model}.delete`
  );
};

/**
 * Safe version of prisma count operation with circuit breaker
 * @param {string} model - Prisma model name
 * @param {Object} options - Count options
 * @returns {Promise<number>} Count operation result
 */
const safeCount = async (model, options = {}) => {
  return executeWithCircuitBreaker(
    async () => prisma[model].count(options),
    `${model}.count`
  );
};

/**
 * Safe version of prisma transaction with circuit breaker
 * @param {Function} txFunction - Transaction function
 * @returns {Promise<any>} Transaction result
 */
const safeTransaction = async (txFunction) => {
  return executeWithCircuitBreaker(
    async () => prisma.$transaction(txFunction),
    'transaction'
  );
};

/**
 * Get circuit breaker status
 * @returns {Object} Circuit breaker state
 */
const getCircuitBreakerStatus = () => {
  return databaseCircuitBreaker.getState();
};

module.exports = {
  // Pagination utilities
  applyPagination,
  formatPaginatedResults,
  paginatedQuery,
  
  // Error handling
  createError,
  executeWithCircuitBreaker,
  
  // Safe database operations
  safeExists,
  safeFindById,
  safeFind,
  safeFindUnique,
  safeFindFirst,
  safeCreate,
  safeUpdate,
  safeDelete,
  safeCount,
  safeTransaction,
  
  // Circuit breaker management
  getCircuitBreakerStatus
};