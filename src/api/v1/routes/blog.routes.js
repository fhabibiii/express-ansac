/**
 * Blog Routes
 * Defines all routes related to blog management
 */

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const blogValidator = require('../validators/blog.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');
const { uploadBlogImage, optimizeImage } = require('../../../shared/middlewares/upload.middleware');
const { uploadLimiter } = require('../../../shared/middlewares/rate-limit.middleware');

// Public routes (no authentication required)
router.get(
  '/public',
  blogController.getPublicBlogs.bind(blogController)
);

// Protected routes (authentication required)
// Create a new blog
router.post(
  '/',
  authenticate,
  blogValidator.validateCreateBlog,
  validate,
  blogController.createBlog.bind(blogController)
);

// Get all blogs (Admin and SuperAdmin only)
router.get(
  '/',
  authenticate,
  blogController.getAllBlogs.bind(blogController)
);

// Get all pending blogs (SuperAdmin only)
router.get(
  '/pending',
  authenticate,
  blogController.getAllPendingBlogs.bind(blogController)
);

// Get blogs created by current user
router.get(
  '/my-blogs',
  authenticate,
  blogController.getUserBlogs.bind(blogController)
);

// Get blog by ID
router.get(
  '/:id',
  authenticate,
  blogValidator.validateBlogId,
  validate,
  blogController.getBlogById.bind(blogController)
);

// Update blog
router.put(
  '/:id',
  authenticate,
  blogValidator.validateUpdateBlog,
  validate,
  blogController.updateBlog.bind(blogController)
);

// Delete blog
router.delete(
  '/:id',
  authenticate,
  blogValidator.validateBlogId,
  validate,
  blogController.deleteBlog.bind(blogController)
);

// Change blog status (SuperAdmin only)
router.put(
  '/:id/status',
  authenticate,
  blogValidator.validateChangeBlogStatus,
  validate,
  blogController.changeBlogStatus.bind(blogController)
);

// Upload blog image
router.post(
  '/upload-image',
  authenticate,
  uploadLimiter, // Menambahkan rate limiter khusus untuk upload
  uploadBlogImage,
  optimizeImage,
  blogController.uploadImage.bind(blogController)
);

module.exports = router;