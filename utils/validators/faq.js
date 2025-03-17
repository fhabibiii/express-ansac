const { body, param } = require('express-validator');

/**
 * Validator for creating a new FAQ
 */
const validateCreateFAQ = [
    body('question')
        .notEmpty().withMessage('Question is required')
        .isString().withMessage('Question must be a string')
];

/**
 * Validator for creating a new FAQ answer
 */
const validateCreateFAQAnswer = [
    body('faqId')
        .notEmpty().withMessage('FAQ ID is required')
        .isInt().withMessage('FAQ ID must be an integer')
        .toInt(),
    body('content')
        .notEmpty().withMessage('Content is required')
        .isString().withMessage('Content must be a string')
];

/**
 * Validator for updating an existing FAQ
 */
const validateUpdateFAQ = [
    param('id')
        .notEmpty().withMessage('FAQ ID is required')
        .isInt().withMessage('FAQ ID must be an integer')
        .toInt(),
    body('question')
        .optional()
        .isString().withMessage('Question must be a string')
];

/**
 * Validator for updating an existing FAQ answer
 */
const validateUpdateFAQAnswer = [
    param('id')
        .notEmpty().withMessage('FAQ answer ID is required')
        .isInt().withMessage('FAQ answer ID must be an integer')
        .toInt(),
    body('content')
        .optional()
        .isString().withMessage('Content must be a string')
];

/**
 * Validator for changing FAQ status
 */
const validateChangeFAQStatus = [
    param('id')
        .notEmpty().withMessage('FAQ ID is required')
        .isInt().withMessage('FAQ ID must be an integer')
        .toInt(),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
];

/**
 * Validator for checking FAQ ID
 */
const validateFAQId = [
    param('id')
        .notEmpty().withMessage('FAQ ID is required')
        .isInt().withMessage('FAQ ID must be an integer')
        .toInt(),
];

/**
 * Validator for checking FAQ answer ID
 */
const validateFAQAnswerId = [
    param('id')
        .notEmpty().withMessage('FAQ answer ID is required')
        .isInt().withMessage('FAQ answer ID must be an integer')
        .toInt(),
];

/**
 * Validator for FAQ ID and answer ID combo (used in API endpoints with both)
 */
const validateFAQAndAnswerIds = [
    param('faqId')
        .notEmpty().withMessage('FAQ ID is required')
        .isInt().withMessage('FAQ ID must be an integer')
        .toInt(),
    param('answerId')
        .notEmpty().withMessage('Answer ID is required')
        .isInt().withMessage('Answer ID must be an integer')
        .toInt(),
];

/**
 * Validator for updating FAQ order
 */
const validateUpdateFAQOrder = [
    body('orderedFaqs')
        .isArray().withMessage('orderedFaqs must be an array')
        .notEmpty().withMessage('orderedFaqs cannot be empty')
        .custom(value => {
            if (!Array.isArray(value)) return false;
            
            // Check that each item has an id property that's a number
            return value.every(item => 
                item && 
                typeof item === 'object' && 
                Object.prototype.hasOwnProperty.call(item, 'id') && 
                !isNaN(parseInt(item.id))
            );
        }).withMessage('Each item in orderedFaqs must have a valid id property')
];

/**
 * Validator for updating FAQ answer order
 */
const validateUpdateFAQAnswerOrder = [
    param('faqId')
        .notEmpty().withMessage('FAQ ID is required')
        .isInt().withMessage('FAQ ID must be an integer')
        .toInt(),
    body('orderedAnswers')
        .isArray().withMessage('orderedAnswers must be an array')
        .notEmpty().withMessage('orderedAnswers cannot be empty')
        .custom(value => {
            if (!Array.isArray(value)) return false;
            
            // Check that each item has an id property that's a number
            return value.every(item => 
                item && 
                typeof item === 'object' && 
                Object.prototype.hasOwnProperty.call(item, 'id') && 
                !isNaN(parseInt(item.id))
            );
        }).withMessage('Each item in orderedAnswers must have a valid id property')
];

module.exports = {
    validateCreateFAQ,
    validateCreateFAQAnswer,
    validateUpdateFAQ,
    validateUpdateFAQAnswer,
    validateChangeFAQStatus,
    validateFAQId,
    validateFAQAnswerId,
    validateFAQAndAnswerIds,
    validateUpdateFAQOrder,
    validateUpdateFAQAnswerOrder
};