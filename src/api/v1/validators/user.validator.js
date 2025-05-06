/**
 * User Validators
 * Validation rules for user management endpoints
 */

const { body, param, query } = require('express-validator');
const { USER_ROLES } = require('../../../shared/constants/app.constants');

// Validate user UUID parameter
const validateUserUuid = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isUUID().withMessage('Invalid user ID format')
];

// Validate create user input
const validateCreateUser = [
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
    
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\s()-]{8,15}$/).withMessage('Please provide a valid phone number'),
    
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date')
    .toDate(),
    
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn([USER_ROLES.USER_SELF, USER_ROLES.USER_PARENT, USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN])
    .withMessage('Role must be a valid user role'),
    
  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
];

// Validate update user input
const validateUpdateUser = [
  ...validateUserUuid,
  
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
  body('phoneNumber')
    .optional()
    .matches(/^[0-9+\s()-]{8,15}$/).withMessage('Please provide a valid phone number'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date')
    .toDate(),
    
  body('address')
    .optional()
    .isString().withMessage('Address must be a string'),
    
  body('username')
    .optional()
    .custom((value) => {
      // Jika string kosong, lewati validasi ini
      if (value === '') return true;
      
      // Validasi string jika tidak kosong
      if (typeof value !== 'string') {
        throw new Error('Username must be a string');
      }
      
      if (value.length < 3 || value.length > 30) {
        throw new Error('Username must be between 3 and 30 characters');
      }
      
      if (!/^[a-zA-Z0-9_\.]+$/.test(value)) {
        throw new Error('Username can only contain letters, numbers, dots and underscores');
      }
      
      return true;
    }),
    
  body('email')
    .optional()
    .custom((value) => {
      // Jika string kosong, lewati validasi ini
      if (value === '') return true;
      
      // Validasi email jika tidak kosong
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Email must be valid');
      }
      
      return true;
    }),
    
  body('role')
    .optional()
    .custom((value) => {
      // Jika string kosong, lewati validasi ini
      if (value === '') return true;
      
      // Validasi role jika tidak kosong
      if (![USER_ROLES.USER_SELF, USER_ROLES.USER_PARENT].includes(value)) {
        throw new Error('Role must be either USER_SELF or USER_PARENT');
      }
      
      return true;
    })
];

// Validate reset password input
const validateResetPassword = [
  ...validateUserUuid,
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Validate check password input
const validateCheckPassword = [
  body('oldPassword')
    .notEmpty().withMessage('Current password is required')
];

// Validate change password input
const validateChangePassword = [
  body('oldPassword')
    .notEmpty().withMessage('Current password is required'),
    
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Validate search query
const validateSearch = [
  query('query')
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
];

module.exports = {
  validateUserUuid,
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateSearch,
  validateCheckPassword,
  validateChangePassword
};