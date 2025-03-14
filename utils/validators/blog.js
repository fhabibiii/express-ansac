const { body, param } = require('express-validator');

const validateCreateBlog = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
    body('imageUrl')
        .notEmpty().withMessage('Image URL is required')
        .isString().withMessage('Image URL must be a string'),
    body('content')
        .notEmpty().withMessage('Content is required')
        .isString().withMessage('Content must be a string'),
];

const validateUpdateBlog = [
    param('id')
        .notEmpty().withMessage('Blog ID is required')
        .isInt().withMessage('Blog ID must be an integer')
        .toInt(),
    body('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
    body('imageUrl')
        .optional()
        .isString().withMessage('Image URL must be a string'),
    body('content')
        .optional()
        .isString().withMessage('Content must be a string'),
];

const validateChangeBlogStatus = [
    param('id')
        .notEmpty().withMessage('Blog ID is required')
        .isInt().withMessage('Blog ID must be an integer')
        .toInt(),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
];

const validateBlogId = [
    param('id')
        .notEmpty().withMessage('Blog ID is required')
        .isInt().withMessage('Blog ID must be an integer')
        .toInt(),
];

module.exports = {
    validateCreateBlog,
    validateUpdateBlog,
    validateChangeBlogStatus,
    validateBlogId
};