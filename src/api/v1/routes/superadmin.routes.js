/**
 * SuperAdmin Routes
 * Defines all routes related to superadmin functionality
 */

const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdmin.controller');
const superAdminValidator = require('../validators/superAdmin.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');
const { adminLimiter } = require('../../../shared/middlewares/rate-limit.middleware');

// All these routes require authentication and superadmin access
router.use(authenticate);

// Apply admin rate limiter to all superadmin routes
router.use(adminLimiter);

// Find all SuperAdmins
router.get(
  '/accounts/superadmins',
  superAdminController.findSuperAdmins.bind(superAdminController)
);

// Find all Admins
router.get(
  '/accounts/admins',
  superAdminController.findAdmins.bind(superAdminController)
);

// Find all regular users
router.get(
  '/accounts/users',
  superAdminController.findUsers.bind(superAdminController)
);

// Create a new user account
router.post(
  '/accounts',
  superAdminValidator.validateCreateAccount,
  validate,
  superAdminController.createAccount.bind(superAdminController)
);

// Find user account by ID
router.get(
  '/accounts/:id',
  superAdminValidator.validateAccountId,
  validate,
  superAdminController.findAccountById.bind(superAdminController)
);

// Update user account
router.put(
  '/accounts/:id',
  superAdminValidator.validateUpdateAccount,
  validate,
  superAdminController.updateAccount.bind(superAdminController)
);

// Delete user account
router.delete(
  '/accounts/:id',
  superAdminValidator.validateAccountId,
  validate,
  superAdminController.deleteAccount.bind(superAdminController)
);

// Accept or reject a test
router.put(
  '/tests/:testId/status',
  superAdminValidator.validateTestStatus,
  validate,
  superAdminController.acceptTest.bind(superAdminController)
);

// Delete a test and all related data
router.delete(
  '/tests/:testId',
  superAdminValidator.validateTestId,
  validate,
  superAdminController.deleteTest.bind(superAdminController)
);

module.exports = router;