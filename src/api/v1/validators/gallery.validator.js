/**
 * Gallery validators
 */
const { body, param } = require('express-validator');

/**
 * Validate gallery creation
 */
exports.validateCreateGallery = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters')
];

/**
 * Validate gallery ID param
 */
exports.validateGalleryId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Gallery ID must be a positive integer')
];

/**
 * Validate gallery update
 */
exports.validateUpdateGallery = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Gallery ID must be a positive integer'),
    
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters')
];

/**
 * Validate change gallery status
 */
exports.validateChangeGalleryStatus = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Gallery ID must be a positive integer'),
    
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['PENDING', 'APPROVED', 'REJECTED'])
        .withMessage('Status must be PENDING, APPROVED, or REJECTED')
];

/**
 * Validate gallery image upload
 */
exports.validateUploadGalleryImage = [
    body('galleryId')
        .isInt({ min: 1 })
        .withMessage('Gallery ID must be a positive integer')
    // Note: File validation is handled by multer middleware
];

/**
 * Validate gallery and image IDs
 */
exports.validateGalleryImageIds = [
    param('galleryId')
        .isInt({ min: 1 })
        .withMessage('Gallery ID must be a positive integer'),
    
    param('imageId')
        .isInt({ min: 1 })
        .withMessage('Image ID must be a positive integer')
];