const { body, param } = require('express-validator');

const validateCreateService = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
    body('shortDesc')
        .notEmpty().withMessage('Short description is required')
        .isString().withMessage('Short description must be a string'),
    body('content')
        .notEmpty().withMessage('Content is required')
        .isString().withMessage('Content must be a string'),
    body('imageUrl')
        .notEmpty().withMessage('Image URL is required')
        .isString().withMessage('Image URL must be a string')
];

const validateUpdateService = [
    param('id')
        .notEmpty().withMessage('Service ID is required')
        .isInt().withMessage('Service ID must be an integer')
        .toInt(),
    body('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
    body('shortDesc')
        .optional()
        .isString().withMessage('Short description must be a string'),
    body('content')
        .optional()
        .isString().withMessage('Content must be a string'),
    body('imageUrl')
        .optional()
        .isString().withMessage('Image URL must be a string')
];

const validateChangeServiceStatus = [
    param('id')
        .notEmpty().withMessage('Service ID is required')
        .isInt().withMessage('Service ID must be an integer')
        .toInt(),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
];

const validateServiceId = [
    param('id')
        .notEmpty().withMessage('Service ID is required')
        .isInt().withMessage('Service ID must be an integer')
        .toInt(),
];

module.exports = {
    validateCreateService,
    validateUpdateService,
    validateChangeServiceStatus,
    validateServiceId
};