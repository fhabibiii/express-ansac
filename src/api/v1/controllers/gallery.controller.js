/**
 * Gallery Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const galleryService = require('../../../services/gallery.service');

class GalleryController extends BaseController {
    constructor() {
        super('gallery');
    }

    /**
     * Create a new gallery
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createGallery(req, res) {
        try {
            const { title } = req.body;
            
            const galleryData = { title };
            
            const newGallery = await galleryService.createGallery(
                galleryData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(
                res,
                'Gallery created successfully',
                newGallery,
                201
            );
        } catch (error) {
            console.error('Create gallery error:', error);
            return this.sendError(res, error.message || 'Failed to create gallery', error.statusCode);
        }
    }

    /**
     * Get all galleries (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllGalleries(req, res) {
        try {
            const galleries = await galleryService.getAllGalleries(req.user.role);
            
            return this.sendSuccess(res, 'Galleries retrieved successfully', galleries);
        } catch (error) {
            console.error('Get galleries error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve galleries', error.statusCode);
        }
    }

    /**
     * Get all pending galleries (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllPendingGalleries(req, res) {
        try {
            const galleries = await galleryService.getAllPendingGalleries(req.user.role);
            
            return this.sendSuccess(res, 'Pending galleries retrieved successfully', galleries);
        } catch (error) {
            console.error('Get pending galleries error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve pending galleries', error.statusCode);
        }
    }

    /**
     * Get galleries created by the current user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserGalleries(req, res) {
        try {
            const galleries = await galleryService.getUserGalleries(
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Your galleries retrieved successfully', galleries);
        } catch (error) {
            console.error('Get user galleries error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve your galleries', error.statusCode);
        }
    }

    /**
     * Get gallery by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getGalleryById(req, res) {
        try {
            const galleryId = req.params.id;
            
            const gallery = await galleryService.getGalleryById(
                galleryId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Gallery retrieved successfully', gallery);
        } catch (error) {
            console.error('Get gallery error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve gallery', error.statusCode);
        }
    }

    /**
     * Update gallery
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateGallery(req, res) {
        try {
            const galleryId = req.params.id;
            const { title } = req.body;
            
            const result = await galleryService.updateGallery(
                galleryId,
                title,
                req.user.id,
                req.user.role
            );
            
            const successMessage = result.statusChanged ? 
                'Gallery updated successfully and status changed to PENDING' : 
                'Gallery updated successfully';
                
            return this.sendSuccess(res, successMessage, result.gallery);
        } catch (error) {
            console.error('Update gallery error:', error);
            return this.sendError(res, error.message || 'Failed to update gallery', error.statusCode);
        }
    }

    /**
     * Delete gallery
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteGallery(req, res) {
        try {
            const galleryId = req.params.id;
            
            await galleryService.deleteGallery(
                galleryId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Gallery and all associated images deleted successfully');
        } catch (error) {
            console.error('Delete gallery error:', error);
            return this.sendError(res, error.message || 'Failed to delete gallery', error.statusCode);
        }
    }

    /**
     * Change gallery status (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async changeGalleryStatus(req, res) {
        try {
            const galleryId = req.params.id;
            const { status } = req.body;
            
            const updatedGallery = await galleryService.changeGalleryStatus(
                galleryId,
                status,
                req.user.role
            );
            
            return this.sendSuccess(res, `Gallery status changed to ${status} successfully`, updatedGallery);
        } catch (error) {
            console.error('Change gallery status error:', error);
            return this.sendError(res, error.message || 'Failed to change gallery status', error.statusCode);
        }
    }

    /**
     * Get public galleries (for all users)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPublicGalleries(req, res) {
        try {
            const galleries = await galleryService.getPublicGalleries();
            
            return this.sendSuccess(res, 'Public galleries retrieved successfully', galleries);
        } catch (error) {
            console.error('Get public galleries error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve public galleries', error.statusCode);
        }
    }

    /**
     * Upload image to gallery
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadGalleryImage(req, res) {
        try {
            const { galleryId } = req.body;
            
            if (!req.file) {
                return this.sendError(res, 'No file uploaded', 400);
            }
            
            const imageData = await galleryService.uploadGalleryImage(
                galleryId,
                req.file,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Image uploaded and added to gallery successfully', imageData);
        } catch (error) {
            console.error('Gallery image upload error:', error);
            return this.sendError(res, error.message || 'Failed to upload image to gallery', error.statusCode);
        }
    }

    /**
     * Set an image as the gallery thumbnail
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async setThumbnail(req, res) {
        try {
            const { galleryId, imageId } = req.params;
            
            const updatedImage = await galleryService.setThumbnail(
                galleryId,
                imageId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Thumbnail set successfully', updatedImage);
        } catch (error) {
            console.error('Set thumbnail error:', error);
            return this.sendError(res, error.message || 'Failed to set thumbnail', error.statusCode);
        }
    }

    /**
     * Delete an image from a gallery
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteImage(req, res) {
        try {
            const { galleryId, imageId } = req.params;
            
            await galleryService.deleteImage(
                galleryId,
                imageId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Image deleted successfully');
        } catch (error) {
            console.error('Delete image error:', error);
            return this.sendError(res, error.message || 'Failed to delete image', error.statusCode);
        }
    }
}

module.exports = new GalleryController();