/**
 * Auth Routes
 * Defines all routes related to authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');
const { loginLimiter, registerLimiter } = require('../../../shared/middlewares/rate-limit.middleware');

// Register a new user - dengan rate limiting khusus untuk registrasi
router.post(
  '/register',
  registerLimiter, // Menambahkan rate limiter khusus untuk registrasi
  authValidator.validateRegister,
  validate,
  authController.register.bind(authController)
);

// Login a user - dengan rate limiting khusus untuk login
router.post(
  '/login',
  loginLimiter, // Menambahkan rate limiter khusus untuk login
  authValidator.validateLogin,
  validate,
  authController.login.bind(authController)
);

// Refresh token - mendapatkan token akses baru menggunakan refresh token
router.post(
  '/refresh-token',
  authValidator.validateRefreshToken,
  validate,
  authController.refreshToken.bind(authController)
);

// Get user profile is now moved to user controller

module.exports = router;