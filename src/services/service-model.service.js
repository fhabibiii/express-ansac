/**
 * Service Model Service
 * Handles business logic for the Service model
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ServiceModelService {
    /**
     * Create a new service
     * @param {Object} serviceData - Service data
     * @returns {Promise<Object>} - Created service
     */
    async createService(serviceData) {
        return prisma.service.create({
            data: serviceData,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    /**
     * Get all services (for admin/superadmin)
     * @param {Object} filterOptions - Filter options
     * @returns {Promise<Array>} - Array of services
     */
    async getAllServices(filterOptions = {}) {
        return prisma.service.findMany({
            where: filterOptions,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get public (published) services
     * @param {Object} filterOptions - Filter options
     * @returns {Promise<Array>} - Array of public services
     */
    async getPublicServices(filterOptions = {}) {
        return prisma.service.findMany({
            where: filterOptions,
            select: {
                id: true,
                title: true,
                shortDesc: true,
                description: true,
                price: true,
                category: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get service categories
     * @returns {Promise<Array>} - Array of service categories
     */
    async getServiceCategories() {
        // These should match the enum in the Prisma schema
        return [
            'GENERAL',
            'CONSULTING',
            'ASSESSMENT',
            'THERAPY',
            'WORKSHOP',
            'TRAINING',
            'OTHER'
        ];
    }

    /**
     * Get service by ID
     * @param {number} id - Service ID
     * @returns {Promise<Object|null>} - Found service or null
     */
    async getServiceById(id) {
        return prisma.service.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    /**
     * Update service
     * @param {number} id - Service ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated service
     */
    async updateService(id, updateData) {
        return prisma.service.update({
            where: { id },
            data: updateData
        });
    }

    /**
     * Delete service
     * @param {number} id - Service ID
     * @returns {Promise<Object>} - Deleted service
     */
    async deleteService(id) {
        return prisma.service.delete({
            where: { id }
        });
    }
}

module.exports = new ServiceModelService();