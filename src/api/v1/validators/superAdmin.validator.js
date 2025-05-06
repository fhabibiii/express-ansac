/**
 * SuperAdmin Validators
 * Validation rules for superadmin functionality
 */

const { body, param } = require('express-validator');
const { USER_ROLES } = require('../../../shared/constants/app.constants');

/**
 * Validate account creation input
 */
exports.validateCreateAccount = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
    
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn([USER_ROLES.USER_SELF, USER_ROLES.USER_PARENT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN])
    .withMessage('Role must be a valid user role'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9+\s()-]{8,15}$/).withMessage('Please provide a valid phone number'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date')
    .toDate()
];

/**
 * Validate account ID parameter
 */
exports.validateAccountId = [
  param('id')
    .notEmpty().withMessage('Account ID is required')
    .isInt({ min: 1 }).withMessage('Account ID must be a positive integer')
];

/**
 * Validate account update input
 */
exports.validateUpdateAccount = [
  param('id')
    .notEmpty().withMessage('Account ID is required')
    .isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
    
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .optional()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
    
  body('role')
    .optional()
    .isIn([USER_ROLES.USER_SELF, USER_ROLES.USER_PARENT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN])
    .withMessage('Role must be a valid user role'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9+\s()-]{8,15}$/).withMessage('Please provide a valid phone number'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date')
    .toDate()
];

/**
 * Validate test status change
 */
exports.validateTestStatus = [
  param('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer'),
    
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['PENDING', 'PUBLISHED', 'REJECTED'])
    .withMessage('Status must be one of: PENDING, PUBLISHED, REJECTED'),
    
  body('rejectionReason')
    .optional()
    .isString().withMessage('Rejection reason must be a string')
];

/**
 * Validate test ID parameter
 */
exports.validateTestId = [
  param('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer')
];