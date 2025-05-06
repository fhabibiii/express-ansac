/**
 * Gallery Routes
 * Defines all routes related to gallery management
 */

const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const galleryValidator = require('../validators/gallery.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');
const { uploadGalleryImage, optimizeImage } = require('../../../shared/middlewares/upload.middleware');
const { uploadLimiter } = require('../../../shared/middlewares/rate-limit.middleware');

// Public routes (no authentication required)
router.get(
  '/public',
  galleryController.getPublicGalleries.bind(galleryController)
);

// Protected routes (authentication required)
// Create a new gallery
router.post(
  '/',
  authenticate,
  galleryValidator.validateCreateGallery,
  validate,
  galleryController.createGallery.bind(galleryController)
);

// Get all galleries (SuperAdmin only)
router.get(
  '/',
  authenticate,
  galleryController.getAllGalleries.bind(galleryController)
);

// Get all pending galleries (SuperAdmin only)
router.get(
  '/pending',
  authenticate,
  galleryController.getAllPendingGalleries.bind(galleryController)
);

// Get galleries created by current user (Admin and SuperAdmin)
router.get(
  '/my-galleries',
  authenticate,
  galleryController.getUserGalleries.bind(galleryController)
);

// Get gallery by ID
router.get(
  '/:id',
  authenticate,
  galleryValidator.validateGalleryId,
  validate,
  galleryController.getGalleryById.bind(galleryController)
);

// Update gallery title
router.put(
  '/:id',
  authenticate,
  galleryValidator.validateUpdateGallery,
  validate,
  galleryController.updateGallery.bind(galleryController)
);

// Delete gallery and all its images
router.delete(
  '/:id',
  authenticate,
  galleryValidator.validateGalleryId,
  validate,
  galleryController.deleteGallery.bind(galleryController)
);

// Change gallery status (SuperAdmin only)
router.patch(
  '/:id/status',
  authenticate,
  galleryValidator.validateChangeGalleryStatus,
  validate,
  galleryController.changeGalleryStatus.bind(galleryController)
);

// Upload image to gallery
router.post(
  '/upload-image',
  authenticate,
  uploadLimiter, // Menambahkan rate limiter khusus untuk upload
  uploadGalleryImage,
  optimizeImage,
  galleryValidator.validateUploadGalleryImage,
  validate,
  galleryController.uploadGalleryImage.bind(galleryController)
);

// Set an image as gallery thumbnail
router.patch(
  '/:galleryId/images/:imageId/set-thumbnail',
  authenticate,
  galleryValidator.validateGalleryImageIds,
  validate,
  galleryController.setThumbnail.bind(galleryController)
);

// Delete an image from a gallery
router.delete(
  '/:galleryId/images/:imageId',
  authenticate,
  galleryValidator.validateGalleryImageIds,
  validate,
  galleryController.deleteImage.bind(galleryController)
);

module.exports = router;