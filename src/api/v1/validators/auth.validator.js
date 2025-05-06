/**
 * Auth Validators
 * Validation rules for authentication related endpoints
 */

const { body } = require('express-validator');
const { USER_ROLES } = require('../../../shared/constants/app.constants');

// Validate user registration input
const validateRegister = [
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
    .toDate()
    .custom(value => {
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
      const maxDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      if (value < minDate || value > maxDate) {
        throw new Error('Age must be between 5 and 100 years');
      }
      return true;
    }),
    
  body('role')
    .optional()
    .isIn([USER_ROLES.USER_SELF, USER_ROLES.USER_PARENT])
    .withMessage('Role must be either USER_SELF or USER_PARENT'),
    
  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
];

// Validate login input
const validateLogin = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string'),
    
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validate refresh token input
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
    .isString().withMessage('Refresh token must be a string')
];

// Validate profile update input
const validateUpdateProfile = [
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
    .toDate()
    .custom(value => {
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
      const maxDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      if (value < minDate || value > maxDate) {
        throw new Error('Age must be between 5 and 100 years');
      }
      return true;
    }),
    
  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
];

// Validate password change input
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
    
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password cannot be the same as the current password');
      }
      return true;
    }),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateChangePassword
};