/**
 * Authentication Middleware
 * Verify JWT tokens and handle authorization
 */

const { HTTP_STATUS, USER_ROLES } = require('../constants/app.constants');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt.utils');
const { errorResponse } = require('../utils/response.utils');
const prisma = require('../../config/database.config');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Authentication token is required', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        uuid: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('User not found', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    // Attach user to request object
    req.user = {
      ...user,
      internalId: user.id,    // Menyimpan ID internal untuk digunakan server-side
      id: user.uuid           // Menggunakan UUID untuk ID yang akan terlihat oleh client
    };
    
    // For backwards compatibility with old code that uses req.userId
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Token has expired. Please refresh your token or login again', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Invalid token', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse('Authentication error', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - List of allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('User not authenticated', HTTP_STATUS.UNAUTHORIZED)
      );
    }
    
    // Super admin has access to everything
    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }
    
    if (roles.length === 0 || roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse('Access denied: insufficient permissions', HTTP_STATUS.FORBIDDEN)
    );
  };
};

/**
 * Check if user is owner of resource or has admin privileges
 * @param {Function} getResourceOwnerId - Function to get owner ID from request
 * @returns {Function} Middleware function
 */
const isResourceOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          errorResponse('User not authenticated', HTTP_STATUS.UNAUTHORIZED)
        );
      }
      
      // Admins and super admins can access all resources
      if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(req.user.role)) {
        return next();
      }
      
      // Get resource owner ID using the provided function
      const ownerId = await getResourceOwnerId(req);
      
      // If resource doesn't exist, move to next middleware
      // It will eventually result in a not found error
      if (ownerId === null) {
        return next();
      }
      
      if (req.user.internalId === ownerId) {
        return next();
      }
      
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Access denied: you do not own this resource', HTTP_STATUS.FORBIDDEN)
      );
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse('Authorization error', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      );
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  isResourceOwnerOrAdmin
};