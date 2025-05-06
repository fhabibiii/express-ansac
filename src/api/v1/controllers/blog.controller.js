/**
 * Blog Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const blogService = require('../../../services/blog.service');
const { BLOG_STATUS } = require('../../../shared/constants/app.constants');
const { logger } = require('../../../shared/utils/logger.utils');

class BlogController extends BaseController {
    constructor() {
        super('blog');
    }

    /**
     * Create a new blog
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createBlog(req, res) {
        try {
            logger.info('createBlog controller called', { 
                userId: req.user.id, 
                userRole: req.user.role 
            });
            
            const { title, content, imageUrl } = req.body;
            
            const blogData = {
                title,
                content,
                imageUrl
            };
            
            const newBlog = await blogService.createBlog(
                blogData,
                req.user.id,
                req.user.role
            );
            
            return this.success(
                res,
                newBlog,
                'Blog created successfully'
            );
        } catch (error) {
            logger.error('Create blog controller error', { 
                userId: req.user?.id,
                error: error.message, 
                stack: error.stack 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Get all blogs (Admin & SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllBlogs(req, res) {
        try {
            logger.info('getAllBlogs controller called', { userRole: req.user.role });
            
            const blogs = await blogService.getAllBlogs(req.user.role);
            
            return this.success(res, blogs, 'Blogs retrieved successfully');
        } catch (error) {
            logger.error('Get blogs controller error', { 
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Get all pending blogs (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllPendingBlogs(req, res) {
        try {
            logger.info('getAllPendingBlogs controller called', { userRole: req.user.role });
            
            const blogs = await blogService.getPendingBlogs(req.user.role);
            
            return this.success(res, blogs, 'Pending blogs retrieved successfully');
        } catch (error) {
            logger.error('Get pending blogs controller error', { 
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Get blog by ID or UUID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getBlogById(req, res) {
        try {
            const blogIdentifier = req.params.id;
            logger.info('getBlogById controller called', { 
                blogIdentifier,
                userId: req.user.id,
                userRole: req.user.role
            });
            
            const blog = await blogService.getBlogById(
                blogIdentifier,
                req.user.id,
                req.user.role
            );
            
            return this.success(res, blog, 'Blog retrieved successfully');
        } catch (error) {
            logger.error('Get blog controller error', { 
                blogIdentifier: req.params.id,
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Update blog
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateBlog(req, res) {
        try {
            const blogIdentifier = req.params.id;
            logger.info('updateBlog controller called', { 
                blogIdentifier,
                userId: req.user.id,
                userRole: req.user.role
            });
            
            const { title, content, imageUrl } = req.body;
            
            const blogData = {
                title,
                content,
                imageUrl
            };
            
            const result = await blogService.updateBlog(
                blogIdentifier,
                blogData,
                req.user.id,
                req.user.role
            );
            
            const message = result.statusChanged 
                ? 'Blog updated successfully and status changed to PENDING' 
                : 'Blog updated successfully';
                
            return this.success(res, result.blog, message);
        } catch (error) {
            logger.error('Update blog controller error', { 
                blogIdentifier: req.params.id,
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Delete blog
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteBlog(req, res) {
        try {
            const blogIdentifier = req.params.id;
            logger.info('deleteBlog controller called', { 
                blogIdentifier,
                userId: req.user.id,
                userRole: req.user.role
            });
            
            await blogService.deleteBlog(
                blogIdentifier,
                req.user.id,
                req.user.role
            );
            
            return this.success(res, null, 'Blog deleted successfully');
        } catch (error) {
            logger.error('Delete blog controller error', { 
                blogIdentifier: req.params.id,
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Change blog status (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async changeBlogStatus(req, res) {
        try {
            const blogIdentifier = req.params.id;
            const { status } = req.body;
            logger.info('changeBlogStatus controller called', { 
                blogIdentifier,
                status,
                userId: req.user.id,
                userRole: req.user.role
            });
            
            // Validate that status is one of the allowed values
            if (![BLOG_STATUS.PENDING, BLOG_STATUS.APPROVED, BLOG_STATUS.REJECTED].includes(status)) {
                logger.warn('Invalid blog status provided', { status, userId: req.user.id });
                return this.badRequest(res, 'Invalid status. Status must be PENDING, APPROVED, or REJECTED');
            }
            
            const updatedBlog = await blogService.changeBlogStatus(
                blogIdentifier,
                status,
                req.user.role
            );
            
            return this.success(res, updatedBlog, `Blog status changed to ${status} successfully`);
        } catch (error) {
            logger.error('Change blog status controller error', { 
                blogIdentifier: req.params.id,
                status: req.body?.status,
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Get public blogs (for all users)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPublicBlogs(req, res) {
        try {
            logger.info('getPublicBlogs controller called');
            
            const blogs = await blogService.getPublicBlogs();
            
            return this.success(res, blogs, 'Public blogs retrieved successfully');
        } catch (error) {
            logger.error('Get public blogs controller error', { error: error.message });
            return this.handleError(res, error);
        }
    }

    /**
     * Upload blog image
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadImage(req, res) {
        try {
            logger.info('uploadImage controller called', { 
                userId: req.user.id,
                userRole: req.user.role,
                hasFile: !!req.file
            });
            
            if (!req.file) {
                logger.warn('Image upload failed: no file received', { userId: req.user.id });
                return this.badRequest(res, 'No file uploaded');
            }
            
            const imageData = await blogService.processUploadedImage(
                req.file,
                req.user.role
            );
            
            return this.success(res, imageData, 'Image uploaded successfully');
        } catch (error) {
            logger.error('Image upload controller error', { 
                userId: req.user?.id,
                fileName: req.file?.originalname,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }

    /**
     * Get blogs created by the current user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserBlogs(req, res) {
        try {
            logger.info('getUserBlogs controller called', { 
                userId: req.user.id,
                userRole: req.user.role
            });
            
            const blogs = await blogService.getUserBlogs(req.user.id, req.user.role);
            
            return this.success(res, blogs, 'Your blogs retrieved successfully');
        } catch (error) {
            logger.error('Get user blogs controller error', { 
                userId: req.user?.id,
                error: error.message 
            });
            return this.handleError(res, error);
        }
    }
}

module.exports = new BlogController();