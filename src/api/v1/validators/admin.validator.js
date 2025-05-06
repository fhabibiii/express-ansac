/**
 * Admin validators
 */
const { body, param } = require('express-validator');
const validate = require('../../../shared/middlewares/validation.middleware');

/**
 * Validate admin creation
 */
exports.validateAdmin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 4, max: 30 })
        .withMessage('Username must be between 4 and 30 characters'),
    
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
    
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('phoneNumber')
        .trim()
        .optional()
        .isMobilePhone()
        .withMessage('Must be a valid phone number'),
    
    body('dateOfBirth')
        .optional()
        .isDate()
        .withMessage('Date of birth must be a valid date'),
    
    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['ADMIN', 'USER_PARENT', 'USER_SELF'])
        .withMessage('Role must be either ADMIN, USER_PARENT, or USER_SELF'),
    
    validate // Apply validation middleware
];

/**
 * Validate admin update
 */
exports.validateUpdateAdmin = [
    param('id')
        .notEmpty()
        .withMessage('User ID is required')
        .isInt()
        .withMessage('User ID must be a number'),
    
    body('username')
        .optional()
        .trim()
        .isLength({ min: 4, max: 30 })
        .withMessage('Username must be between 4 and 30 characters'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
    
    body('password')
        .optional()
        .trim()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('phoneNumber')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Must be a valid phone number'),
    
    body('dateOfBirth')
        .optional()
        .isDate()
        .withMessage('Date of birth must be a valid date'),
    
    body('role')
        .optional()
        .trim()
        .isIn(['ADMIN', 'USER_PARENT', 'USER_SELF'])
        .withMessage('Role must be either ADMIN, USER_PARENT, or USER_SELF'),
    
    validate // Apply validation middleware
];