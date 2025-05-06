/**
 * Service validators
 */
const { body, param } = require('express-validator');

/**
 * Validate service creation
 */
exports.validateCreateService = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    
    body('shortDesc')
        .trim()
        .notEmpty()
        .withMessage('Short description is required')
        .isLength({ min: 10, max: 200 })
        .withMessage('Short description must be between 10 and 200 characters'),
    
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    
    body('image')
        .optional()
        .isURL()
        .withMessage('Image must be a valid URL'),
    
    body('isPublished')
        .optional()
        .isBoolean()
        .withMessage('isPublished must be a boolean value'),
    
    body('price')
        .optional()
        .isNumeric()
        .withMessage('Price must be a number')
];

/**
 * Validate service update
 */
exports.validateUpdateService = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Service ID must be a positive integer'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    
    body('shortDesc')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Short description must be between 10 and 200 characters'),
    
    body('content')
        .optional()
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    
    body('image')
        .optional()
        .isURL()
        .withMessage('Image must be a valid URL'),
    
    body('isPublished')
        .optional()
        .isBoolean()
        .withMessage('isPublished must be a boolean value'),
    
    body('price')
        .optional()
        .isNumeric()
        .withMessage('Price must be a number')
];

/**
 * Validate service ID parameter
 */
exports.validateServiceId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Service ID must be a positive integer')
];

/**
 * Validate change service status
 */
exports.validateChangeServiceStatus = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Service ID must be a positive integer'),
    
    body('status')
        .isIn(['PENDING', 'PUBLISHED', 'REJECTED'])
        .withMessage('Status must be one of: PENDING, PUBLISHED, REJECTED'),
    
    body('rejectionReason')
        .optional()
        .trim()
        .isString()
        .withMessage('Rejection reason must be a string')
];