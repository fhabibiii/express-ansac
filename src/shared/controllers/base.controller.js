/**
 * Base Controller
 * Provides common functionality for all controllers
 */

const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants/app.constants');
const prisma = require('../../config/database.config');
const { logger } = require('../utils/logger.utils');
const telegramMonitor = require('../utils/telegram.monitor');

class BaseController {
  /**
   * Check if the request has validation errors
   * @param {Object} req - Express request object
   */
  validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = HTTP_STATUS.VALIDATION_ERROR;
      error.errors = errors.array().map(err => ({
        [err.path]: err.msg
      }));
      throw error;
    }
  }

  /**
   * Handle errors in controllers
   * @param {Object} res - Express response object
   * @param {Error} error - Error object
   */
  handleError(res, error) {
    // Membuat pesan log yang lebih informatif dengan konteks dari controller spesifik
    const controllerName = this.controllerName || 'unknown';
    let logMessage = '';
    
    // Jika ada konteks, gunakan konteks untuk membuat pesan yang lebih relevan
    if (error.context) {
      const actionName = error.context.action || 'operation';
      
      switch (actionName) {
        case 'user_registration':
          logMessage = `Registration failed for username "${error.context.username}": ${error.message}`;
          break;
        case 'user_login':
          logMessage = `Login failed for username "${error.context.username}": ${error.message}`;
          break;
        default:
          logMessage = `${actionName} failed: ${error.message}`;
      }
    } else {
      // Jika tidak ada konteks, gunakan format default
      logMessage = `Controller error in ${controllerName}: ${error.message}`;
    }
    
    // Tentukan status code, default ke internal server error jika tidak ditetapkan
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    
    // Tentukan apakah ini error sistem atau error pengguna
    // Status 4xx dianggap kesalahan pengguna, status 5xx adalah kesalahan sistem
    const isUserError = statusCode < 500;
    
    // Log level berdasarkan jenis error
    // Kesalahan pengguna (validasi, data duplikat, dll.) gunakan "warn"
    // Kesalahan sistem gunakan "error"
    const logLevel = isUserError ? 'warn' : 'error';
    
    // Flag untuk mengidentifikasi apakah notifikasi telah dikirim ke Telegram
    let telegramNotificationSent = false;
    
    // Hanya kirim ke Telegram untuk error sistem (5xx)
    if (!isUserError) {
      const monitor = telegramMonitor.getInstance();
      if (monitor) {
        const errorContext = {
          controller: controllerName,
          statusCode: statusCode,
          validationErrors: error.errors ? JSON.stringify(error.errors) : undefined,
          ...(error.context || {}) // Gabungkan semua konteks dari controller spesifik
        };
        
        // Kirim ke Telegram dengan format yang standar dan dapatkan status keberhasilan
        try {
          // reportError async, tapi kita ingin mencatat hasilnya segera
          // Jika tidak bisa terhubung ke Telegram, kita tidak ingin menunggu timeout
          monitor.reportError(error, errorContext)
            .then(sent => {
              // Update flag pada error object setelah mencoba mengirim
              error.telegramNotificationSent = sent;
            })
            .catch(() => {
              // Jika terjadi error saat mengirim, anggap notifikasi gagal
              error.telegramNotificationSent = false;
            });
          
          // Asumsikan awalnya berhasil dikirim
          telegramNotificationSent = true;
        } catch (e) {
          // Tangani kesalahan saat mencoba memanggil reportError
          console.error(`[BaseController] Failed to send error to Telegram: ${e.message}`);
          telegramNotificationSent = false;
        }
      }
    }
    
    // Log error dengan format yang standar 
    logger[logLevel](logMessage, {
      statusCode: statusCode,
      errorType: error.name,
      controller: controllerName,
      context: error.context || {},
      stack: error.stack,
      errors: error.errors,
      telegramNotificationSent: telegramNotificationSent
    });
    
    const errorResponse = {
      success: false,
      message: error.message || 'Something went wrong',
      status: statusCode
    };
    
    if (error.errors) {
      errorResponse.errors = error.errors;
    }
    
    return res.status(statusCode).json(errorResponse);
  }

  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {Object} data - Data to send in response
   * @param {string} message - Success message
   */
  success(res, data, message = 'Operation successful') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send created response
   * @param {Object} res - Express response object
   * @param {Object} data - Data to send in response
   * @param {string} message - Success message
   */
  created(res, data, message = 'Resource created successfully') {
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send no content response
   * @param {Object} res - Express response object
   */
  noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Send bad request response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  badRequest(res, message = 'Bad request') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message
    });
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  unauthorized(res, message = 'Unauthorized') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message
    });
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  forbidden(res, message = 'Forbidden') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message
    });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  notFound(res, message = 'Resource not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message
    });
  }

  /**
   * Get user from database based on request userId
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} User object from database
   */
  async getUser(req) {
    if (!req.userId) {
      const error = new Error('User ID not found in request');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }
    
    return user;
  }

  /**
   * Apply pagination to database queries
   * @param {Object} req - Express request object
   * @param {number} defaultLimit - Default limit per page
   * @param {number} maxLimit - Maximum limit per page
   * @returns {Object} Pagination parameters
   */
  getPaginationParams(req, defaultLimit = 10, maxLimit = 50) {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    
    // Ensure limit is not above max
    if (limit > maxLimit) {
      limit = maxLimit;
    }
    
    const skip = (page - 1) * limit;
    
    return {
      skip,
      take: limit,
      page,
      limit
    };
  }

  /**
   * Format pagination response
   * @param {Array} data - Data to paginate
   * @param {number} count - Total count of items
   * @param {Object} paginationParams - Pagination parameters
   * @returns {Object} Formatted response with pagination info
   */
  formatPaginatedResponse(data, count, { page, limit }) {
    const totalPages = Math.ceil(count / limit);
    
    return {
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

module.exports = BaseController;