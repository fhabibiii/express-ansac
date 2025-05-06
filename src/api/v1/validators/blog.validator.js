/**
 * Blog validators
 */
const { body, param } = require('express-validator');
const { BLOG_STATUS } = require('../../../shared/constants/app.constants');

/**
 * Validate blog creation
 */
exports.validateCreateBlog = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    
    body('imageUrl')
        .notEmpty()
        .withMessage('Image URL is required')
        .isString()
        .withMessage('Image URL must be a string')
];

/**
 * Validate blog update
 */
exports.validateUpdateBlog = [
    param('id')
        .notEmpty()
        .withMessage('Blog identifier is required')
        .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('Invalid blog UUID format'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    
    body('content')
        .optional()
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    
    body('imageUrl')
        .optional()
        .isString()
        .withMessage('Image URL must be a string')
];

/**
 * Validate blog ID or UUID
 */
exports.validateBlogId = [
    param('id')
        .notEmpty()
        .withMessage('Blog identifier is required')
        .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('Invalid blog UUID format')
];

/**
 * Validate change blog status
 */
exports.validateChangeBlogStatus = [
    param('id')
        .notEmpty()
        .withMessage('Blog identifier is required')
        .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('Invalid blog UUID format'),
    
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn([BLOG_STATUS.PENDING, BLOG_STATUS.APPROVED, BLOG_STATUS.REJECTED])
        .withMessage('Status must be PENDING, APPROVED, or REJECTED')
];