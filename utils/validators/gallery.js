const { body, param } = require('express-validator');

const validateCreateGallery = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
];

const validateUpdateGallery = [
    param('id')
        .notEmpty().withMessage('Gallery ID is required')
        .isInt().withMessage('Gallery ID must be an integer')
        .toInt(),
    body('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
];

const validateChangeGalleryStatus = [
    param('id')
        .notEmpty().withMessage('Gallery ID is required')
        .isInt().withMessage('Gallery ID must be an integer')
        .toInt(),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
];

const validateGalleryId = [
    param('id')
        .notEmpty().withMessage('Gallery ID is required')
        .isInt().withMessage('Gallery ID must be an integer')
        .toInt(),
];

const validateGalleryImageIds = [
    param('galleryId')
        .notEmpty().withMessage('Gallery ID is required')
        .isInt().withMessage('Gallery ID must be an integer')
        .toInt(),
    param('imageId')
        .notEmpty().withMessage('Image ID is required')
        .isInt().withMessage('Image ID must be an integer')
        .toInt(),
];

const validateUploadImage = [
    body('galleryId')
        .notEmpty().withMessage('Gallery ID is required')
        .isInt().withMessage('Gallery ID must be an integer')
        .toInt(),
];

module.exports = {
    validateCreateGallery,
    validateUpdateGallery,
    validateChangeGalleryStatus,
    validateGalleryId,
    validateGalleryImageIds,
    validateUploadImage
};