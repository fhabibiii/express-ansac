/**
 * Service Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const serviceModelService = require('../../../services/service-model.service');

class ServiceController extends BaseController {
    constructor() {
        super('service');
    }

    /**
     * Create a new service
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createService(req, res) {
        try {
            const { title, shortDesc, content, imageUrl } = req.body;
            
            const serviceData = {
                title,
                shortDesc,
                content,
                imageUrl
            };
            
            const newService = await serviceModelService.createService(
                serviceData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(
                res,
                'Service created successfully',
                newService,
                201
            );
        } catch (error) {
            console.error('Create service error:', error);
            return this.sendError(res, error.message || 'Failed to create service', error.statusCode);
        }
    }

    /**
     * Get all services (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllServices(req, res) {
        try {
            const services = await serviceModelService.getAllServices(req.user.role);
            
            return this.sendSuccess(res, 'Services retrieved successfully', services);
        } catch (error) {
            console.error('Get services error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve services', error.statusCode);
        }
    }

    /**
     * Get all pending and rejected services
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllPendingAndRejectedServices(req, res) {
        try {
            const services = await serviceModelService.getPendingAndRejectedServices(req.user.role);
            
            return this.sendSuccess(res, 'Pending and rejected services retrieved successfully', services);
        } catch (error) {
            console.error('Get pending services error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve pending services', error.statusCode);
        }
    }

    /**
     * Get service by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getServiceById(req, res) {
        try {
            const serviceId = req.params.id;
            
            const service = await serviceModelService.getServiceById(
                serviceId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Service retrieved successfully', service);
        } catch (error) {
            console.error('Get service error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve service', error.statusCode);
        }
    }

    /**
     * Update service
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateService(req, res) {
        try {
            const serviceId = req.params.id;
            const { title, shortDesc, content, imageUrl } = req.body;
            
            const serviceData = {
                title,
                shortDesc,
                content,
                imageUrl
            };
            
            const updatedService = await serviceModelService.updateService(
                serviceId,
                serviceData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Service updated successfully', updatedService);
        } catch (error) {
            console.error('Update service error:', error);
            return this.sendError(res, error.message || 'Failed to update service', error.statusCode);
        }
    }

    /**
     * Delete service
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteService(req, res) {
        try {
            const serviceId = req.params.id;
            
            await serviceModelService.deleteService(
                serviceId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Service deleted successfully');
        } catch (error) {
            console.error('Delete service error:', error);
            return this.sendError(res, error.message || 'Failed to delete service', error.statusCode);
        }
    }

    /**
     * Change service status (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async changeServiceStatus(req, res) {
        try {
            const serviceId = req.params.id;
            const { status } = req.body;
            
            const updatedService = await serviceModelService.changeServiceStatus(
                serviceId,
                status,
                req.user.role
            );
            
            return this.sendSuccess(res, `Service status changed to ${status} successfully`, updatedService);
        } catch (error) {
            console.error('Change service status error:', error);
            return this.sendError(res, error.message || 'Failed to change service status', error.statusCode);
        }
    }

    /**
     * Get public services (for all users)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPublicServices(req, res) {
        try {
            const services = await serviceModelService.getPublicServices();
            
            return this.sendSuccess(res, 'Public services retrieved successfully', services);
        } catch (error) {
            console.error('Get public services error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve public services', error.statusCode);
        }
    }

    /**
     * Upload service image
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return this.sendError(res, 'No file uploaded', 400);
            }
            
            const imageData = await serviceModelService.processUploadedImage(
                req.file,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Image uploaded successfully', imageData);
        } catch (error) {
            console.error('Image upload error:', error);
            return this.sendError(res, error.message || 'Failed to upload image', error.statusCode);
        }
    }
}

module.exports = new ServiceController();