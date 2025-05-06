/**
 * User Queries Utilities
 * Centralized location for common user database queries
 * Using safe database operations with circuit breaker protection
 */

const bcrypt = require('bcryptjs');
const { logger } = require('./logger.utils');
const dbUtils = require('./db.utils');

/**
 * Standard user select fields for profile data
 */
const userProfileFields = {
  id: true,
  uuid: true,
  username: true,
  name: true,
  email: true,
  phoneNumber: true,
  dateOfBirth: true,
  role: true,
  address: true,
  createdAt: true
};

/**
 * Find user by internal ID
 * @param {number} userId - Internal user ID
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - User object
 */
const findUserById = async (userId, options = {}) => {
  try {
    const { includePassword = false, select = userProfileFields } = options;
    
    // If password is needed, add it to the select fields
    const selectFields = includePassword ? { ...select, password: true } : select;
    
    // Make sure userId is an integer
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Use safeFindById with circuit breaker protection
    return await dbUtils.safeFindById('user', id, { select: selectFields });
  } catch (error) {
    logger.error('Error finding user by ID', { userId, error: error.message });
    throw error;
  }
};

/**
 * Find user by UUID
 * @param {string} uuid - User UUID
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - User object
 */
const findUserByUuid = async (uuid, options = {}) => {
  try {
    const { includePassword = false, select = userProfileFields } = options;
    
    // If password is needed, add it to the select fields
    const selectFields = includePassword ? { ...select, password: true } : select;
    
    // Use safeFindUnique with circuit breaker protection
    return await dbUtils.safeFindUnique('user', {
      where: { uuid },
      select: selectFields
    });
  } catch (error) {
    logger.error('Error finding user by UUID', { uuid, error: error.message });
    throw error;
  }
};

/**
 * Find user by username
 * @param {string} username - Username
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - User object
 */
const findUserByUsername = async (username, options = {}) => {
  try {
    const { includePassword = false, select = userProfileFields } = options;
    
    // If password is needed, add it to the select fields
    const selectFields = includePassword ? { ...select, password: true } : select;
    
    // Use safeFindUnique with circuit breaker protection
    return await dbUtils.safeFindUnique('user', {
      where: { username },
      select: selectFields
    });
  } catch (error) {
    logger.error('Error finding user by username', { username, error: error.message });
    throw error;
  }
};

/**
 * Find user by email
 * @param {string} email - Email
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - User object
 */
const findUserByEmail = async (email, options = {}) => {
  try {
    const { includePassword = false, select = userProfileFields } = options;
    
    // If password is needed, add it to the select fields
    const selectFields = includePassword ? { ...select, password: true } : select;
    
    // Use safeFindUnique with circuit breaker protection
    return await dbUtils.safeFindUnique('user', {
      where: { email },
      select: selectFields
    });
  } catch (error) {
    logger.error('Error finding user by email', { email, error: error.message });
    throw error;
  }
};

/**
 * Find user by phone number
 * @param {string} phoneNumber - Phone number
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - User object
 */
const findUserByPhoneNumber = async (phoneNumber, options = {}) => {
  try {
    const { includePassword = false, select = userProfileFields } = options;
    
    // If password is needed, add it to the select fields
    const selectFields = includePassword ? { ...select, password: true } : select;
    
    // Use safeFindUnique with circuit breaker protection
    return await dbUtils.safeFindUnique('user', {
      where: { phoneNumber },
      select: selectFields
    });
  } catch (error) {
    logger.error('Error finding user by phone number', { phoneNumber, error: error.message });
    throw error;
  }
};

/**
 * Get all users with pagination
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - Paginated list of users
 */
const getAllUsers = async (options = {}) => {
  try {
    const { 
      page, 
      limit, 
      orderBy = { createdAt: 'desc' }, 
      select = userProfileFields,
      where = {} 
    } = options;
    
    const queryOptions = {
      select,
      orderBy,
      where
    };
    
    // If pagination is requested, use paginatedQuery
    if (page && limit) {
      return await dbUtils.paginatedQuery('user', queryOptions, page, limit);
    }
    
    // Otherwise use safeFind
    return await dbUtils.safeFind('user', queryOptions);
  } catch (error) {
    logger.error('Error getting all users', { error: error.message });
    throw error;
  }
};

/**
 * Get users by role with pagination
 * @param {string} role - User role
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - Paginated list of users
 */
const getUsersByRole = async (role, options = {}) => {
  try {
    const { 
      page, 
      limit, 
      orderBy = { createdAt: 'desc' }, 
      select = userProfileFields
    } = options;
    
    const queryOptions = {
      where: { role },
      select,
      orderBy
    };
    
    // If pagination is requested, use paginatedQuery
    if (page && limit) {
      return await dbUtils.paginatedQuery('user', queryOptions, page, limit);
    }
    
    // Otherwise use safeFind
    return await dbUtils.safeFind('user', queryOptions);
  } catch (error) {
    logger.error('Error getting users by role', { role, error: error.message });
    throw error;
  }
};

/**
 * Check if username already exists (excluding the specified user)
 * @param {string} username - Username to check
 * @param {string|number} excludeUserId - User ID to exclude from check (optional)
 * @returns {Promise<boolean>} - Whether username exists
 */
const isUsernameExists = async (username, excludeUserId = null) => {
  try {
    if (!username) return false;
    
    let where = { username };
    
    // If we're excluding a user (for updates), add NOT condition
    if (excludeUserId) {
      if (typeof excludeUserId === 'string' && !isNaN(excludeUserId)) {
        // It's a string representing a number (internal ID)
        where.NOT = { id: parseInt(excludeUserId, 10) };
      } else if (typeof excludeUserId === 'number') {
        // It's already a number (internal ID)
        where.NOT = { id: excludeUserId };
      } else {
        // Assume it's a UUID
        where.NOT = { uuid: excludeUserId };
      }
    }
    
    // Use safeExists with circuit breaker protection
    return await dbUtils.safeExists('user', where);
  } catch (error) {
    logger.error('Error checking if username exists', { username, error: error.message });
    throw error;
  }
};

/**
 * Check if email already exists (excluding the specified user)
 * @param {string} email - Email to check
 * @param {string|number} excludeUserId - User ID to exclude from check (optional)
 * @returns {Promise<boolean>} - Whether email exists
 */
const isEmailExists = async (email, excludeUserId = null) => {
  try {
    if (!email) return false;
    
    let where = { email };
    
    // If we're excluding a user (for updates), add NOT condition
    if (excludeUserId) {
      if (typeof excludeUserId === 'string' && !isNaN(excludeUserId)) {
        // It's a string representing a number (internal ID)
        where.NOT = { id: parseInt(excludeUserId, 10) };
      } else if (typeof excludeUserId === 'number') {
        // It's already a number (internal ID)
        where.NOT = { id: excludeUserId };
      } else {
        // Assume it's a UUID
        where.NOT = { uuid: excludeUserId };
      }
    }
    
    // Use safeExists with circuit breaker protection
    return await dbUtils.safeExists('user', where);
  } catch (error) {
    logger.error('Error checking if email exists', { email, error: error.message });
    throw error;
  }
};

/**
 * Check if phone number already exists (excluding the specified user)
 * @param {string} phoneNumber - Phone number to check
 * @param {string|number} excludeUserId - User ID to exclude from check (optional)
 * @returns {Promise<boolean>} - Whether phone number exists
 */
const isPhoneNumberExists = async (phoneNumber, excludeUserId = null) => {
  try {
    if (!phoneNumber) return false;
    
    let where = { phoneNumber };
    
    // If we're excluding a user (for updates), add NOT condition
    if (excludeUserId) {
      if (typeof excludeUserId === 'string' && !isNaN(excludeUserId)) {
        // It's a string representing a number (internal ID)
        where.NOT = { id: parseInt(excludeUserId, 10) };
      } else if (typeof excludeUserId === 'number') {
        // It's already a number (internal ID)
        where.NOT = { id: excludeUserId };
      } else {
        // Assume it's a UUID
        where.NOT = { uuid: excludeUserId };
      }
    }
    
    // Use safeExists with circuit breaker protection
    return await dbUtils.safeExists('user', where);
  } catch (error) {
    logger.error('Error checking if phone number exists', { phoneNumber, error: error.message });
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Promise<Object>} - Created user
 */
const createUser = async (data) => {
  try {
    // If password is provided, hash it
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    
    // Use safeCreate with circuit breaker protection
    return await dbUtils.safeCreate('user', {
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error creating user', { error: error.message });
    throw error;
  }
};

/**
 * Update user by ID
 * @param {number} userId - User ID
 * @param {Object} data - Data to update
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - Updated user
 */
const updateUserById = async (userId, data, options = {}) => {
  try {
    const { select = userProfileFields } = options;
    const updateData = { ...data, updatedAt: new Date() };
    
    // If password is provided, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    // Make sure userId is an integer
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Use safeUpdate with circuit breaker protection
    return await dbUtils.safeUpdate('user', {
      where: { id },
      data: updateData,
      select
    });
  } catch (error) {
    logger.error('Error updating user by ID', { userId, error: error.message });
    throw error;
  }
};

/**
 * Update user by UUID
 * @param {string} uuid - User UUID
 * @param {Object} data - Data to update
 * @param {Object} options - Options for the query
 * @returns {Promise<Object>} - Updated user
 */
const updateUserByUuid = async (uuid, data, options = {}) => {
  try {
    const { select = userProfileFields } = options;
    const updateData = { ...data, updatedAt: new Date() };
    
    // If password is provided, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    // Use safeUpdate with circuit breaker protection
    return await dbUtils.safeUpdate('user', {
      where: { uuid },
      data: updateData,
      select
    });
  } catch (error) {
    logger.error('Error updating user by UUID', { uuid, error: error.message });
    throw error;
  }
};

/**
 * Delete user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Deleted user
 */
const deleteUserById = async (userId) => {
  try {
    // Make sure userId is an integer
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Use safeDelete with circuit breaker protection
    return await dbUtils.safeDelete('user', {
      where: { id }
    });
  } catch (error) {
    logger.error('Error deleting user by ID', { userId, error: error.message });
    throw error;
  }
};

/**
 * Delete user by UUID
 * @param {string} uuid - User UUID
 * @returns {Promise<Object>} - Deleted user
 */
const deleteUserByUuid = async (uuid) => {
  try {
    // Use safeDelete with circuit breaker protection
    return await dbUtils.safeDelete('user', {
      where: { uuid }
    });
  } catch (error) {
    logger.error('Error deleting user by UUID', { uuid, error: error.message });
    throw error;
  }
};

/**
 * Verify password against hashed password
 * @param {string} plainPassword - Plain password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - Whether password is valid
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Error verifying password', { error: error.message });
    throw error;
  }
};

/**
 * Hash password
 * @param {string} password - Plain password
 * @param {number} saltRounds - Salt rounds
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Error hashing password', { error: error.message });
    throw error;
  }
};

/**
 * Transform user object for public API (using UUID as ID)
 * @param {Object} user - User object with internal ID and UUID
 * @returns {Object} - Transformed user object for public API
 */
const transformUserForPublicApi = (user) => {
  if (!user) return null;
  
  // Create a new object without uuid field and sensitive data
  const { uuid, password, ...userWithoutSensitiveData } = user;
  
  // Replace id with uuid
  return {
    ...userWithoutSensitiveData,
    id: uuid
  };
};

module.exports = {
  // Field selectors
  userProfileFields,
  
  // Find operations
  findUserById,
  findUserByUuid,
  findUserByUsername,
  findUserByEmail,
  findUserByPhoneNumber,
  
  // List operations
  getAllUsers,
  getUsersByRole,
  
  // Validation
  isUsernameExists,
  isEmailExists,
  isPhoneNumberExists,
  
  // CRUD operations
  createUser,
  updateUserById,
  updateUserByUuid,
  deleteUserById,
  deleteUserByUuid,
  
  // Password utils
  verifyPassword,
  hashPassword,
  
  // Transformation
  transformUserForPublicApi
};