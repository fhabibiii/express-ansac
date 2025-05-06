/**
 * Service Routes
 * Defines all routes related to service management
 */

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const serviceValidator = require('../validators/service.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');
const { uploadServiceImage, optimizeImage } = require('../../../shared/middlewares/upload.middleware');
const { uploadLimiter } = require('../../../shared/middlewares/rate-limit.middleware');

// Public routes (no authentication required)
router.get(
  '/public',
  serviceController.getPublicServices.bind(serviceController)
);

// Protected routes (authentication required)
// Create a new service
router.post(
  '/',
  authenticate,
  serviceValidator.validateCreateService,
  validate,
  serviceController.createService.bind(serviceController)
);

// Get all services (SuperAdmin only)
router.get(
  '/',
  authenticate,
  serviceController.getAllServices.bind(serviceController)
);

// Get all pending and rejected services
router.get(
  '/pending-rejected',
  authenticate,
  serviceController.getAllPendingAndRejectedServices.bind(serviceController)
);

// Get service by ID
router.get(
  '/:id',
  authenticate,
  serviceValidator.validateServiceId,
  validate,
  serviceController.getServiceById.bind(serviceController)
);

// Update service
router.put(
  '/:id',
  authenticate,
  serviceValidator.validateUpdateService,
  validate,
  serviceController.updateService.bind(serviceController)
);

// Delete service
router.delete(
  '/:id',
  authenticate,
  serviceValidator.validateServiceId,
  validate,
  serviceController.deleteService.bind(serviceController)
);

// Change service status (SuperAdmin only)
router.put(
  '/:id/status',
  authenticate,
  serviceValidator.validateChangeServiceStatus,
  validate,
  serviceController.changeServiceStatus.bind(serviceController)
);

// Upload service image
router.post(
  '/upload-image',
  authenticate,
  uploadLimiter, // Menambahkan rate limiter khusus untuk upload
  uploadServiceImage,
  optimizeImage,
  serviceController.uploadImage.bind(serviceController)
);

module.exports = router;