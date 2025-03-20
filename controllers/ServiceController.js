const express = require("express");
const { validationResult } = require("express-validator");
const prisma = require("../prisma/client");
const fs = require("fs");
const path = require("path");

// Create Service
const createService = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Check if user has admin/superadmin role
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { title, shortDesc, content, imageUrl } = req.body;
        
        // Simple validation check
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image URL is required. Please upload an image first.",
            });
        }

        const service = await prisma.service.create({
            data: {
                title,
                shortDesc,
                imageUrl,
                content,
                status: "PENDING" // Default status
            }
        });

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Services (SuperAdmin only, only APPROVED services)
const getAllServices = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only SuperAdmin can access this function
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can access all services.",
            });
        }

        // SuperAdmin sees all APPROVED services
        const services = await prisma.service.findMany({
            where: {
                status: 'APPROVED'
            },
            select: {
                id: true,
                title: true,
                shortDesc: true, // Include shortDesc instead of content
                imageUrl: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all pending and rejected services
const getAllPendingAndRejectServices = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only SuperAdmin can access this function
        if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin and Admin can access pending and rejected services.",
            });
        }

        // Get all services with PENDING or REJECTED status
        const services = await prisma.service.findMany({
            where: {
                status: {
                    in: ['PENDING', 'REJECTED']
                }
            },
            select: {
                id: true,
                title: true,
                shortDesc: true, // Include shortDesc instead of content
                imageUrl: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Service by ID
const getServiceById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validate that id is a number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID format",
            });
        }
        
        const service = await prisma.service.findUnique({
            where: { id }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: `Service with id: ${id} not found`,
            });
        }

        // Check permissions based on role and status
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role === 'USER_SELF' || user.role === 'USER_PARENT') {
            // Regular users can only see APPROVED services
            if (service.status !== 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        } else if (user.role === 'ADMIN') {
            // Admins can see PENDING/REJECTED services
            if (service.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        }
        // SuperAdmin can see all services

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Helper function to extract filename from URL
const extractFilename = (url) => {
    if (!url) return null;
    try {
        // Handle both URL and file path formats
        const parts = url.split(/[\/\\]/);
        return parts[parts.length - 1];
    } catch (error) {
        console.error("Error extracting filename:", error);
        return null;
    }
};

// Update Service
const updateService = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { id } = req.params;
        const { title, shortDesc, content, imageUrl } = req.body;

        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: `Service with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can edit any service
        let updateData = {
            title: title || existingService.title,
            shortDesc: shortDesc || existingService.shortDesc,
            imageUrl: imageUrl || existingService.imageUrl,
            content: content || existingService.content,
        };
        
        let statusChangeMessage = "";

        if (user.role === 'SUPERADMIN') {
            // If service is APPROVED, keep it APPROVED
            // If service is REJECTED, change to PENDING
            if (existingService.status === 'REJECTED') {
                updateData.status = 'PENDING';
                statusChangeMessage = " and status changed to PENDING";
            }
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins cannot edit APPROVED services
            if (existingService.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot edit an approved service.",
                });
            }
            
            // If service is REJECTED, change to PENDING
            if (existingService.status === 'REJECTED') {
                updateData.status = 'PENDING';
                statusChangeMessage = " and status changed to PENDING";
            }
        } 
        // Other roles cannot edit
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // If image URL is changing, delete the old image
        if (imageUrl && imageUrl !== existingService.imageUrl) {
            const oldFilename = extractFilename(existingService.imageUrl);
            if (oldFilename) {
                const oldFilePath = path.join(__dirname, '../public/uploads/services', oldFilename);
                
                // Log file path for debugging
                console.log(`Attempting to delete old image: ${oldFilePath}`);
                
                // Delete the old file if it exists
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                        console.log(`Successfully deleted old service image: ${oldFilePath}`);
                    } catch (err) {
                        console.error(`Failed to delete old image file: ${err.message}`);
                    }
                } else {
                    console.log(`Old image file not found: ${oldFilePath}`);
                }
            }
        }

        // Update service
        const updatedService = await prisma.service.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: `Service updated successfully${statusChangeMessage}`,
            data: updatedService
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Service
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: `Service with id: ${id} not found`,
            });
        }

        // Permission checks...

        // Delete the image file from the server
        const filename = extractFilename(existingService.imageUrl);
        if (filename) {
            const filePath = path.join(__dirname, '../public/uploads/services', filename);
            
            // Log for debugging
            console.log(`Attempting to delete service image: ${filePath}`);
            
            // Delete the file if it exists
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Successfully deleted service image: ${filePath}`);
                } catch (err) {
                    console.error(`Failed to delete image file: ${err.message}`);
                }
            } else {
                console.log(`Service image not found: ${filePath}`);
            }
        }

        // Delete service from database
        await prisma.service.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: "Service and associated image deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Change Service Status (for SuperAdmin)
const changeServiceStatus = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check if user is SuperAdmin
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can change service status.",
            });
        }

        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: `Service with id: ${id} not found`,
            });
        }

        // Update status
        const updatedService = await prisma.service.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: `Service status changed to ${status} successfully`,
            data: updatedService
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Public Services (for all users)
const getPublicServices = async (req, res) => {
    try {
        // Only fetch APPROVED services
        const services = await prisma.service.findMany({
            where: {
                status: 'APPROVED'
            },
            select: {
                id: true,
                title: true,
                shortDesc: true, // Include shortDesc instead of content
                imageUrl: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Upload Image (separate endpoint to handle file uploads)
const uploadImage = async (req, res) => {
    try {
        // Check user permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Process file upload
        if (!req.file) {
            return res.status(400).json({
                success: false, 
                message: "No file uploaded"
            });
        }

        // Ensure services directory exists
        const servicesDir = path.join(__dirname, '../public/uploads/services');
        if (!fs.existsSync(servicesDir)) {
            fs.mkdirSync(servicesDir, { recursive: true });
        }

        // Use absolute URL instead of relative path
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const imageUrl = `${baseUrl}/uploads/services/${req.file.filename}`;

        // Get info about optimized file (with error handling)
        let fileSizeInMB = "unknown";
        try {
            if (fs.existsSync(req.file.path)) {
                const fileSizeInBytes = fs.statSync(req.file.path).size;
                fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2) + "MB";
            }
        } catch (err) {
            console.error("Error getting file size:", err);
        }

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                imageUrl,
                filename: req.file.filename,
                format: "webp",
                size: fileSizeInMB
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createService,
    getAllServices,
    getAllPendingAndRejectServices,
    getServiceById,
    updateService,
    deleteService,
    changeServiceStatus,
    getPublicServices,
    uploadImage
};