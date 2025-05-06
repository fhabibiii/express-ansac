/**
 * User Routes
 * Defines all routes related to user management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const userValidator = require('../validators/user.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');

// Get user's own account by ID (now using UUID)
router.get(
  '/:id',
  authenticate,
  userValidator.validateUserUuid,
  validate,
  userController.findAccountById.bind(userController)
);

// Update user's own account
router.put(
  '/:id',
  authenticate,
  userValidator.validateUpdateUser, // Sudah menggunakan validateUserUuid di dalamnya
  validate,
  userController.updateAccount.bind(userController)
);

// Delete user's own account
router.delete(
  '/:id',
  authenticate,
  userValidator.validateUserUuid,
  validate,
  userController.deleteAccount.bind(userController)
);

// Check if password matches
router.post(
  '/check-password',
  authenticate,
  userValidator.validateCheckPassword,
  validate,
  userController.checkPassword.bind(userController)
);

// Change user's password
router.post(
  '/change-password',
  authenticate,
  userValidator.validateChangePassword,
  validate,
  userController.changePassword.bind(userController)
);

module.exports = router;