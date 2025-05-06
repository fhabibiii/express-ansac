/**
 * FAQ validators
 */
const { body, param } = require('express-validator');

/**
 * Validate FAQ creation
 */
exports.validateCreateFAQ = [
    body('question')
        .trim()
        .notEmpty()
        .withMessage('Question is required')
        .isLength({ min: 10, max: 255 })
        .withMessage('Question must be between 10 and 255 characters'),
    
    body('isPublished')
        .optional()
        .isBoolean()
        .withMessage('isPublished must be a boolean value')
];

/**
 * Validate FAQ update
 */
exports.validateUpdateFAQ = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('FAQ ID must be a positive integer'),
    
    body('question')
        .optional()
        .trim()
        .isLength({ min: 10, max: 255 })
        .withMessage('Question must be between 10 and 255 characters'),
    
    body('isPublished')
        .optional()
        .isBoolean()
        .withMessage('isPublished must be a boolean value')
];

/**
 * Validate FAQ answer creation
 */
exports.validateCreateFAQAnswer = [
    body('faqId')
        .isInt({ min: 1 })
        .withMessage('FAQ ID must be a positive integer'),
    
    body('answer')
        .trim()
        .notEmpty()
        .withMessage('Answer is required')
        .isLength({ min: 10 })
        .withMessage('Answer must be at least 10 characters')
];

/**
 * Validate FAQ answer update
 */
exports.validateUpdateFAQAnswer = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('FAQ Answer ID must be a positive integer'),
    
    body('answer')
        .trim()
        .notEmpty()
        .withMessage('Answer is required')
        .isLength({ min: 10 })
        .withMessage('Answer must be at least 10 characters')
];

/**
 * Validate FAQ ID parameter
 */
exports.validateFAQId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('FAQ ID must be a positive integer')
];

/**
 * Validate answer ID parameter
 */
exports.validateAnswerId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('FAQ Answer ID must be a positive integer')
];

/**
 * Validate change FAQ status
 */
exports.validateChangeFAQStatus = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('FAQ ID must be a positive integer'),
    
    body('status')
        .isIn(['PENDING', 'PUBLISHED', 'REJECTED'])
        .withMessage('Status must be one of: PENDING, PUBLISHED, REJECTED'),
    
    body('rejectionReason')
        .optional()
        .trim()
        .isString()
        .withMessage('Rejection reason must be a string')
];

/**
 * Validate update FAQ order
 */
exports.validateUpdateFAQOrder = [
    body('order')
        .isArray()
        .withMessage('Order must be an array'),
    
    body('order.*.id')
        .isInt({ min: 1 })
        .withMessage('Each FAQ item must have a valid ID'),
    
    body('order.*.position')
        .isInt({ min: 0 })
        .withMessage('Each FAQ item must have a valid position')
];

/**
 * Validate update FAQ answer order
 */
exports.validateUpdateFAQAnswerOrder = [
    param('faqId')
        .isInt({ min: 1 })
        .withMessage('FAQ ID must be a positive integer'),
    
    body('order')
        .isArray()
        .withMessage('Order must be an array'),
    
    body('order.*.id')
        .isInt({ min: 1 })
        .withMessage('Each answer item must have a valid ID'),
    
    body('order.*.position')
        .isInt({ min: 0 })
        .withMessage('Each answer item must have a valid position')
];