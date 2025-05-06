/**
 * Blog Queries Utilities
 * Centralized location for common blog database queries
 * Using safe database operations with circuit breaker protection
 */

const { BLOG_STATUS } = require('../constants/app.constants');
const { logger } = require('./logger.utils');
const dbUtils = require('./db.utils');

/**
 * Standard blog select fields with author
 */
const blogWithAuthorFields = {
  id: true,
  uuid: true,
  title: true,
  imageUrl: true,
  content: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      uuid: true,
      name: true
    }
  }
};

/**
 * Standard blog select fields without author
 */
const blogBasicFields = {
  id: true,
  uuid: true,
  title: true,
  imageUrl: true,
  content: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

/**
 * Find blog by ID
 * @param {number} blogId - Blog ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Blog object
 */
const findBlogById = async (blogId, options = {}) => {
  try {
    const { includeAuthor = false } = options;
    const select = includeAuthor ? blogWithAuthorFields : blogBasicFields;
    
    // Make sure blogId is an integer
    const id = typeof blogId === 'string' ? parseInt(blogId, 10) : blogId;
    
    // Use safeFindById with circuit breaker protection
    return await dbUtils.safeFindById('blog', id, 
      includeAuthor ? { include: { author: { select: { id: true, uuid: true, name: true } } } } : { select }
    );
  } catch (error) {
    logger.error('Error finding blog by ID', { blogId, error: error.message });
    throw error;
  }
};

/**
 * Find blog by UUID
 * @param {string} uuid - Blog UUID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Blog object
 */
const findBlogByUuid = async (uuid, options = {}) => {
  try {
    const { includeAuthor = false } = options;
    const select = includeAuthor ? blogWithAuthorFields : blogBasicFields;
    
    // Use safeFindUnique with circuit breaker protection
    return await dbUtils.safeFindUnique('blog', {
      where: { uuid },
      ...(includeAuthor ? { include: { author: { select: { id: true, uuid: true, name: true } } } } : { select })
    });
  } catch (error) {
    logger.error('Error finding blog by UUID', { uuid, error: error.message });
    throw error;
  }
};

/**
 * Find blog by ID or UUID
 * @param {string} identifier - Blog UUID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Blog object
 */
const findBlogByIdentifier = async (identifier, options = {}) => {
  try {
    // We only accept UUID format now, not numeric IDs
    if (/^\d+$/.test(identifier)) {
      logger.warn('Numeric ID format rejected, only UUID is accepted', { id: identifier });
      return null; // Return null for numeric IDs
    } else {
      logger.debug('Finding blog by UUID', { uuid: identifier });
      return await findBlogByUuid(identifier, options);
    }
  } catch (error) {
    logger.error('Error finding blog by identifier', { identifier, error: error.message });
    throw error;
  }
};

/**
 * Get all blogs
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of blogs
 */
const getAllBlogs = async (options = {}) => {
  try {
    const { orderBy = { createdAt: 'desc' }, includeAuthor = true, page, limit } = options;
    
    // If pagination is requested, use paginatedQuery
    if (page && limit) {
      return await dbUtils.paginatedQuery('blog', {
        select: blogWithAuthorFields,
        orderBy
      }, page, limit);
    }
    
    // Otherwise use safeFind
    return await dbUtils.safeFind('blog', {
      select: blogWithAuthorFields,
      orderBy
    });
  } catch (error) {
    logger.error('Error getting all blogs', { error: error.message });
    throw error;
  }
};

/**
 * Get blogs by status
 * @param {string} status - Blog status (PENDING, APPROVED, REJECTED)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of blogs
 */
const getBlogsByStatus = async (status, options = {}) => {
  try {
    const { orderBy = { createdAt: 'desc' }, includeAuthor = true, page, limit } = options;
    
    const queryOptions = {
      where: { status },
      select: blogWithAuthorFields,
      orderBy
    };
    
    // If pagination is requested, use paginatedQuery
    if (page && limit) {
      return await dbUtils.paginatedQuery('blog', queryOptions, page, limit);
    }
    
    // Otherwise use safeFind
    return await dbUtils.safeFind('blog', queryOptions);
  } catch (error) {
    logger.error('Error getting blogs by status', { status, error: error.message });
    throw error;
  }
};

/**
 * Get blogs by user
 * @param {number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of blogs
 */
const getBlogsByUser = async (userId, options = {}) => {
  try {
    const { orderBy = { createdAt: 'desc' }, includeAuthor = false, page, limit } = options;
    const select = includeAuthor ? blogWithAuthorFields : blogBasicFields;
    
    // Make sure userId is an integer
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    const queryOptions = {
      where: { createdBy: id },
      select,
      orderBy
    };
    
    // If pagination is requested, use paginatedQuery
    if (page && limit) {
      return await dbUtils.paginatedQuery('blog', queryOptions, page, limit);
    }
    
    // Otherwise use safeFind
    return await dbUtils.safeFind('blog', queryOptions);
  } catch (error) {
    logger.error('Error getting blogs by user', { userId, error: error.message });
    throw error;
  }
};

/**
 * Get public blogs (APPROVED only)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of public blogs
 */
const getPublicBlogs = async (options = {}) => {
  try {
    const { orderBy = { createdAt: 'desc' }, page, limit } = options;
    
    const queryOptions = {
      where: {
        status: BLOG_STATUS.APPROVED
      },
      select: {
        id: true,
        uuid: true,
        title: true,
        imageUrl: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            uuid: true
          }
        }
      },
      orderBy
    };
    
    // If pagination is requested, use paginatedQuery
    if (page && limit) {
      return await dbUtils.paginatedQuery('blog', queryOptions, page, limit);
    }
    
    // Otherwise use safeFind
    return await dbUtils.safeFind('blog', queryOptions);
  } catch (error) {
    logger.error('Error getting public blogs', { error: error.message });
    throw error;
  }
};

/**
 * Create a new blog
 * @param {Object} data - Blog data
 * @returns {Promise<Object>} - Created blog
 */
const createBlog = async (data) => {
  try {
    // Use safeCreate with circuit breaker protection
    return await dbUtils.safeCreate('blog', {
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error creating blog', { error: error.message });
    throw error;
  }
};

/**
 * Update a blog
 * @param {number} blogId - Blog ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} - Updated blog
 */
const updateBlogById = async (blogId, data) => {
  try {
    // Make sure blogId is an integer
    const id = typeof blogId === 'string' ? parseInt(blogId, 10) : blogId;
    
    // Use safeUpdate with circuit breaker protection
    return await dbUtils.safeUpdate('blog', {
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error updating blog', { blogId, error: error.message });
    throw error;
  }
};

/**
 * Update a blog by UUID
 * @param {string} uuid - Blog UUID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} - Updated blog
 */
const updateBlogByUuid = async (uuid, data) => {
  try {
    // Use safeUpdate with circuit breaker protection
    return await dbUtils.safeUpdate('blog', {
      where: { uuid },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error updating blog by UUID', { uuid, error: error.message });
    throw error;
  }
};

/**
 * Delete a blog by ID
 * @param {number} blogId - Blog ID
 * @returns {Promise<Object>} - Deleted blog
 */
const deleteBlogById = async (blogId) => {
  try {
    // Make sure blogId is an integer
    const id = typeof blogId === 'string' ? parseInt(blogId, 10) : blogId;
    
    // Use safeDelete with circuit breaker protection
    return await dbUtils.safeDelete('blog', {
      where: { id }
    });
  } catch (error) {
    logger.error('Error deleting blog', { blogId, error: error.message });
    throw error;
  }
};

/**
 * Delete a blog by UUID
 * @param {string} uuid - Blog UUID
 * @returns {Promise<Object>} - Deleted blog
 */
const deleteBlogByUuid = async (uuid) => {
  try {
    // Use safeDelete with circuit breaker protection
    return await dbUtils.safeDelete('blog', {
      where: { uuid }
    });
  } catch (error) {
    logger.error('Error deleting blog by UUID', { uuid, error: error.message });
    throw error;
  }
};

/**
 * Transform blog object for public API (making UUID the external ID)
 * @param {Object} blog - Blog object
 * @returns {Object} - Transformed blog
 */
const transformBlogForPublicApi = (blog) => {
  if (!blog) return null;
  
  // Create a copy without uuid field
  const { uuid, ...blogWithoutUuid } = blog;
  
  // Replace id with uuid
  return {
    ...blogWithoutUuid,
    id: uuid
  };
};

module.exports = {
  // Field selectors
  blogWithAuthorFields,
  blogBasicFields,
  
  // Find operations
  findBlogById,
  findBlogByUuid,
  findBlogByIdentifier,
  
  // List operations
  getAllBlogs,
  getBlogsByStatus,
  getBlogsByUser,
  getPublicBlogs,
  
  // CRUD operations
  createBlog,
  updateBlogById,
  updateBlogByUuid,
  deleteBlogById,
  deleteBlogByUuid,
  
  // Transformation
  transformBlogForPublicApi
};