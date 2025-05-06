/**
 * Blog Service
 * Handles blog-related business logic
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../config/database.config');
const { HTTP_STATUS, BLOG_STATUS } = require('../shared/constants/app.constants');
const { logger } = require('../shared/utils/logger.utils');
const blogQueries = require('../shared/utils/blog-queries.utils');

class BlogService {
  /**
   * Create a new blog post
   * @param {Object} blogData - Blog post data
   * @param {number} userId - ID of the creator
   * @param {string} userRole - Role of the creator
   * @returns {Promise<Object>} - Created blog post
   */
  async createBlog(blogData, userId, userRole) {
    logger.info('Creating new blog post', { userId, userRole });
    
    // Check user permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      logger.warn('Blog creation denied due to insufficient permissions', { userId, userRole });
      throw error;
    }

    const { title, content, imageUrl } = blogData;

    if (!imageUrl) {
      const error = new Error('Image URL is required. Please upload an image first.');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      logger.warn('Blog creation failed: missing image URL', { userId });
      throw error;
    }

    try {
      const blog = await blogQueries.createBlog({
        title,
        imageUrl,
        content,
        createdBy: userId,
        status: BLOG_STATUS.PENDING,
        updatedAt: new Date()
      });

      logger.info('Blog post created successfully', { blogId: blog.id, blogUuid: blog.uuid, userId });
      return blog;
    } catch (error) {
      logger.error('Failed to create blog post', { userId, error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get all blogs (SuperAdmin only)
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Array>} - List of blogs
   */
  async getAllBlogs(userRole) {
    logger.info('Getting all blogs', { userRole });
    
    // Only SuperAdmin can access this function
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied. Only SuperAdmin can access all blogs.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      logger.warn('Access to all blogs denied', { userRole });
      throw error;
    }

    try {
      const blogs = await blogQueries.getAllBlogs();
      logger.info('Retrieved all blogs successfully', { count: blogs.length });
      return blogs;
    } catch (error) {
      logger.error('Failed to retrieve all blogs', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get all pending blogs (SuperAdmin only)
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Array>} - List of pending blogs
   */
  async getPendingBlogs(userRole) {
    logger.info('Getting pending blogs', { userRole });
    
    // Only SuperAdmin can access this function
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied. Only SuperAdmin can access pending blogs.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      logger.warn('Access to pending blogs denied', { userRole });
      throw error;
    }

    try {
      const blogs = await blogQueries.getBlogsByStatus(BLOG_STATUS.PENDING);
      logger.info('Retrieved pending blogs successfully', { count: blogs.length });
      return blogs;
    } catch (error) {
      logger.error('Failed to retrieve pending blogs', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get blog by ID or UUID
   * @param {string} identifier - Blog ID or UUID
   * @param {number} userId - ID of user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Blog post
   */
  async getBlogById(identifier, userId, userRole) {
    logger.info('Getting blog by identifier', { identifier, userId, userRole });
    
    try {
      const blog = await blogQueries.findBlogByIdentifier(identifier);

      if (!blog) {
        const error = new Error(`Blog not found`);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        logger.warn('Blog not found', { identifier });
        throw error;
      }

      // Check permissions based on role and status
      if (userRole === 'USER_SELF' || userRole === 'USER_PARENT') {
        if (blog.status !== BLOG_STATUS.APPROVED) {
          const error = new Error('Access denied');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          logger.warn('Access denied to non-approved blog for regular user', { userId, blogId: blog.id, status: blog.status });
          throw error;
        }
      }

      // Admin can only see their own posts or APPROVED posts
      if (userRole === 'ADMIN') {
        if (blog.createdBy !== userId && blog.status !== BLOG_STATUS.APPROVED) {
          const error = new Error('Access denied');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          logger.warn('Access denied for admin to blog created by another user', { userId, createdBy: blog.createdBy, blogId: blog.id });
          throw error;
        }
      }
      // SuperAdmin can see all blogs

      // Get the complete blog with author
      const blogWithAuthor = await blogQueries.findBlogById(blog.id, { includeAuthor: true });

      logger.info('Retrieved blog successfully', { blogId: blog.id, blogUuid: blog.uuid });
      return blogWithAuthor;
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Failed to retrieve blog', { identifier, error: error.message, stack: error.stack });
      }
      throw error;
    }
  }

  /**
   * Update blog
   * @param {string} identifier - Blog ID or UUID
   * @param {Object} updateData - Blog update data
   * @param {number} userId - ID of user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated blog
   */
  async updateBlog(identifier, updateData, userId, userRole) {
    logger.info('Updating blog', { identifier, userId, userRole });
    
    try {
      // Check if blog exists
      const existingBlog = await blogQueries.findBlogByIdentifier(identifier);

      if (!existingBlog) {
        const error = new Error(`Blog not found`);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        logger.warn('Blog not found for update', { identifier });
        throw error;
      }

      // Check permissions
      if (userRole === 'SUPERADMIN') {
        // SuperAdmin can edit any blog
        logger.debug('SuperAdmin updating blog', { blogId: existingBlog.id });
      } else if (userRole === 'ADMIN') {
        if (existingBlog.createdBy !== userId) {
          const error = new Error('Access denied. Cannot edit another user\'s blog.');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          logger.warn('Admin attempted to update another user\'s blog', { userId, createdBy: existingBlog.createdBy, blogId: existingBlog.id });
          throw error;
        }
        logger.debug('Admin updating own blog', { blogId: existingBlog.id });
      } else {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        logger.warn('Unauthorized role attempted to update blog', { userRole, userId, blogId: existingBlog.id });
        throw error;
      }

      const { title, content, imageUrl } = updateData;
      
      // Prepare update data
      const blogUpdateData = {
        title: title || existingBlog.title,
        imageUrl: imageUrl || existingBlog.imageUrl,
        content: content || existingBlog.content,
        updatedAt: new Date()
      };
      
      // If blog status is REJECTED, change to PENDING when updated
      if (existingBlog.status === BLOG_STATUS.REJECTED) {
        blogUpdateData.status = BLOG_STATUS.PENDING;
        logger.info('Changing blog status from REJECTED to PENDING', { blogId: existingBlog.id });
      }

      // Update blog
      const updatedBlog = await blogQueries.updateBlogById(existingBlog.id, blogUpdateData);

      logger.info('Blog updated successfully', { 
        blogId: updatedBlog.id, 
        blogUuid: updatedBlog.uuid,
        statusChanged: existingBlog.status === BLOG_STATUS.REJECTED
      });
      
      return {
        blog: updatedBlog,
        statusChanged: existingBlog.status === BLOG_STATUS.REJECTED
      };
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Failed to update blog', { identifier, userId, error: error.message, stack: error.stack });
      }
      throw error;
    }
  }

  /**
   * Extract filename from imageUrl
   * @param {string} imageUrl - URL of the image
   * @returns {string} - Filename
   */
  extractFilename(imageUrl) {
    // This handles both URLs with / and Windows paths with \
    const parts = imageUrl.split(/[\/\\]/);
    return parts[parts.length - 1];
  }

  /**
   * Delete blog
   * @param {string} identifier - Blog ID or UUID
   * @param {number} userId - ID of user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<void>}
   */
  async deleteBlog(identifier, userId, userRole) {
    logger.info('Deleting blog', { identifier, userId, userRole });
    
    try {
      // Check if blog exists
      const existingBlog = await blogQueries.findBlogByIdentifier(identifier);

      if (!existingBlog) {
        const error = new Error(`Blog not found`);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        logger.warn('Blog not found for deletion', { identifier });
        throw error;
      }

      // Check permissions
      if (userRole === 'SUPERADMIN') {
        // SuperAdmin can delete any blog
        logger.debug('SuperAdmin deleting blog', { blogId: existingBlog.id });
      } else if (userRole === 'ADMIN') {
        if (existingBlog.createdBy !== userId) {
          const error = new Error('Access denied. Cannot delete another user\'s blog.');
          error.statusCode = HTTP_STATUS.FORBIDDEN;
          logger.warn('Admin attempted to delete another user\'s blog', { userId, createdBy: existingBlog.createdBy, blogId: existingBlog.id });
          throw error;
        }
        logger.debug('Admin deleting own blog', { blogId: existingBlog.id });
      } else {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        logger.warn('Unauthorized role attempted to delete blog', { userRole, userId, blogId: existingBlog.id });
        throw error;
      }

      // Delete the image file from the server
      try {
        const filename = this.extractFilename(existingBlog.imageUrl);
        const filePath = path.join(__dirname, '../../public/uploads/blog', filename);
        
        // Delete the file if it exists
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info('Blog image file deleted', { filename, blogId: existingBlog.id });
        } else {
          logger.warn('Blog image file not found for deletion', { filename, blogId: existingBlog.id });
        }
      } catch (error) {
        logger.error('Error deleting blog image file', { 
          blogId: existingBlog.id, 
          imageUrl: existingBlog.imageUrl,
          error: error.message
        });
        // Continue with blog deletion even if image deletion fails
      }

      // Delete blog from database
      await blogQueries.deleteBlogById(existingBlog.id);
      
      logger.info('Blog deleted successfully', { blogId: existingBlog.id, blogUuid: existingBlog.uuid });
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Failed to delete blog', { identifier, userId, error: error.message, stack: error.stack });
      }
      throw error;
    }
  }

  /**
   * Change blog status (SuperAdmin only)
   * @param {string} identifier - Blog ID or UUID
   * @param {string} status - New status (PENDING, APPROVED, REJECTED)
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated blog
   */
  async changeBlogStatus(identifier, status, userRole) {
    logger.info('Changing blog status', { identifier, status, userRole });
    
    try {
      // Check if user is SuperAdmin
      if (userRole !== 'SUPERADMIN') {
        const error = new Error('Access denied. Only SuperAdmin can change blog status.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        logger.warn('Status change denied due to insufficient permissions', { userRole, status });
        throw error;
      }

      // Validate status
      if (![BLOG_STATUS.PENDING, BLOG_STATUS.APPROVED, BLOG_STATUS.REJECTED].includes(status)) {
        const error = new Error('Invalid status. Status must be PENDING, APPROVED, or REJECTED.');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        logger.warn('Invalid blog status provided', { status });
        throw error;
      }

      // Check if blog exists
      const existingBlog = await blogQueries.findBlogByIdentifier(identifier);

      if (!existingBlog) {
        const error = new Error(`Blog not found`);
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        logger.warn('Blog not found for status change', { identifier });
        throw error;
      }

      // Update status
      const updatedBlog = await blogQueries.updateBlogById(existingBlog.id, { 
        status,
        updatedAt: new Date()
      });

      logger.info('Blog status changed successfully', { 
        blogId: updatedBlog.id, 
        blogUuid: updatedBlog.uuid,
        oldStatus: existingBlog.status,
        newStatus: status
      });
      
      return updatedBlog;
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Failed to change blog status', { identifier, status, error: error.message, stack: error.stack });
      }
      throw error;
    }
  }

  /**
   * Get public blogs
   * @returns {Promise<Array>} - List of public blogs
   */
  async getPublicBlogs() {
    logger.info('Getting public blogs');
    
    try {
      const blogs = await blogQueries.getPublicBlogs();
      logger.info('Retrieved public blogs successfully', { count: blogs.length });
      return blogs;
    } catch (error) {
      logger.error('Failed to retrieve public blogs', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get blogs created by user
   * @param {number} userId - ID of the user
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Array>} - List of user's blogs
   */
  async getUserBlogs(userId, userRole) {
    logger.info('Getting blogs by user', { userId, userRole });
    
    try {
      // Check permissions
      if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        logger.warn('Access to user blogs denied due to insufficient permissions', { userId, userRole });
        throw error;
      }

      const blogs = await blogQueries.getBlogsByUser(userId);
      logger.info('Retrieved user blogs successfully', { userId, count: blogs.length });
      return blogs;
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Failed to retrieve user blogs', { userId, error: error.message, stack: error.stack });
      }
      throw error;
    }
  }

  /**
   * Process uploaded image for blog
   * @param {Object} file - Uploaded file object
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Image data
   */
  async processUploadedImage(file, userRole) {
    logger.info('Processing uploaded blog image', { 
      fileName: file?.originalname,
      fileSize: file?.size,
      userRole
    });
    
    try {
      // Check user permissions
      if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        logger.warn('Image upload denied due to insufficient permissions', { userRole });
        throw error;
      }

      if (!file) {
        const error = new Error('No file uploaded');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        logger.warn('Image upload failed: no file received');
        throw error;
      }

      // Get file information
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const imageUrl = `${baseUrl}/uploads/blog/${file.filename}`;

      // Get file size information
      let fileSizeInMB = "unknown";
      try {
        if (fs.existsSync(file.path)) {
          const fileSizeInBytes = fs.statSync(file.path).size;
          fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
        }
      } catch (error) {
        logger.error('Error getting file size', { filePath: file.path, error: error.message });
      }

      const imageData = {
        imageUrl,
        format: path.extname(file.originalname).substring(1),
        size: `${fileSizeInMB}MB`
      };
      
      logger.info('Blog image processed successfully', { 
        imageUrl, 
        fileName: file.originalname,
        fileSize: fileSizeInMB
      });
      
      return imageData;
    } catch (error) {
      if (!error.statusCode) {
        logger.error('Failed to process uploaded image', { error: error.message, stack: error.stack });
      }
      throw error;
    }
  }
}

module.exports = new BlogService();