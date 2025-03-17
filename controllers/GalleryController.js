const express = require("express");
const { validationResult } = require("express-validator");
const prisma = require("../prisma/client");
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirAsync = promisify(fs.mkdir);

// Helper function to ensure gallery directory exists
const ensureGalleryDir = async (galleryId) => {
    const galleryDir = path.join(__dirname, '../public/uploads/galleries', `gallery-${galleryId}`);
    if (!fs.existsSync(galleryDir)) {
        await mkdirAsync(galleryDir, { recursive: true });
        // Set proper permissions for Unix systems
        if (process.platform !== 'win32') {
            try {
                fs.chmodSync(galleryDir, 0o755);
            } catch (err) {
                console.error(`Unable to set permissions on gallery directory: ${err.message}`);
            }
        }
    }
    return galleryDir;
};

// Create a new gallery
const createGallery = async (req, res) => {
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

        const { title } = req.body;
        
        // Create gallery without images initially
        const gallery = await prisma.gallery.create({
            data: {
                title,
                createdBy: req.userId,
                status: "PENDING" // Default status
            }
        });

        res.status(201).json({
            success: true,
            message: "Gallery created successfully",
            data: gallery,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all galleries (SuperAdmin only)
const getAllGallerys = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only SuperAdmin can access this function
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can access all galleries.",
            });
        }

        // SuperAdmin sees all galleries (no restrictions)
        const galleries = await prisma.gallery.findMany({
            include: {
                images: {
                    where: {
                        isThumbnail: true
                    },
                    take: 1
                },
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

        // Format the response to include thumbnail
        const formattedGalleries = galleries.map(gallery => ({
            id: gallery.id,
            title: gallery.title,
            status: gallery.status,
            createdAt: gallery.createdAt,
            updatedAt: gallery.updatedAt,
            thumbnail: gallery.images[0]?.imageUrl || null,
            author: gallery.author
        }));

        res.status(200).json({
            success: true,
            data: formattedGalleries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all pending galleries (SuperAdmin only)
const getAllPendingGallerys = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only SuperAdmin can access this function
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can access pending galleries.",
            });
        }

        // Get all galleries with PENDING status
        const galleries = await prisma.gallery.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                images: {
                    where: {
                        isThumbnail: true
                    },
                    take: 1
                },
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

        // Format the response to include thumbnail
        const formattedGalleries = galleries.map(gallery => ({
            id: gallery.id,
            title: gallery.title,
            status: gallery.status,
            createdAt: gallery.createdAt,
            updatedAt: gallery.updatedAt,
            thumbnail: gallery.images[0]?.imageUrl || null,
            author: gallery.author
        }));

        res.status(200).json({
            success: true,
            data: formattedGalleries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get galleries created by the current user
const getUserGallerys = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Filter to only show galleries created by this user
        const whereClause = {
            createdBy: req.userId
        };

        const galleries = await prisma.gallery.findMany({
            where: whereClause,
            include: {
                images: {
                    where: {
                        isThumbnail: true
                    },
                    take: 1
                },
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

        // Format the response to include thumbnail
        const formattedGalleries = galleries.map(gallery => ({
            id: gallery.id,
            title: gallery.title,
            status: gallery.status,
            createdAt: gallery.createdAt,
            updatedAt: gallery.updatedAt,
            thumbnail: gallery.images[0]?.imageUrl || null,
            author: gallery.author
        }));

        res.status(200).json({
            success: true,
            data: formattedGalleries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Gallery by ID
const getGalleryById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validate that id is a number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery ID format",
            });
        }
        
        const gallery = await prisma.gallery.findUnique({
            where: { id },
            include: {
                images: true,
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: `Gallery with id: ${id} not found`,
            });
        }

        // Check permissions based on role and status
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role === 'USER_SELF' || user.role === 'USER_PARENT') {
            // Regular users can only see APPROVED galleries
            if (gallery.status !== 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        } else if (user.role === 'ADMIN') {
            // Admins can see their own galleries or PENDING/REJECTED galleries
            if (gallery.createdBy !== req.userId && gallery.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        }
        // SuperAdmin can see all galleries

        res.status(200).json({
            success: true,
            data: gallery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update gallery title
const updateGallery = async (req, res) => {
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
        const { title } = req.body;

        // Check if gallery exists
        const existingGallery = await prisma.gallery.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingGallery) {
            return res.status(404).json({
                success: false,
                message: `Gallery with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can edit any gallery
        if (user.role === 'SUPERADMIN') {
            // Allow editing - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins can only update their own galleries with status PENDING or REJECTED
            if (existingGallery.createdBy !== req.userId || existingGallery.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot edit an approved gallery or another admin's gallery.",
                });
            }
        } 
        // Other roles cannot edit
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Prepare update data
        const updateData = {
            title: title || existingGallery.title,
        };
        
        // If gallery status is REJECTED, change to PENDING when updated
        if (existingGallery.status === 'REJECTED') {
            updateData.status = 'PENDING';
        }

        // Update gallery
        const updatedGallery = await prisma.gallery.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: existingGallery.status === 'REJECTED' ? 
                "Gallery updated successfully and status changed to PENDING" : 
                "Gallery updated successfully",
            data: updatedGallery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Extract filename from imageUrl (cross-platform version)
const extractFilename = (imageUrl) => {
    // This handles both URLs with / and Windows paths with \
    const parts = imageUrl.split(/[\/\\]/);
    return parts[parts.length - 1];
};

// Delete gallery and all its images
const deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const galleryId = parseInt(id);

        // Check if gallery exists
        const existingGallery = await prisma.gallery.findUnique({
            where: { id: galleryId },
            include: {
                images: true
            }
        });

        if (!existingGallery) {
            return res.status(404).json({
                success: false,
                message: `Gallery with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can delete any gallery
        if (user.role === 'SUPERADMIN') {
            // Allow deletion - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins can only delete their own galleries with status PENDING or REJECTED
            if (existingGallery.createdBy !== req.userId || existingGallery.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot delete an approved gallery or another admin's gallery.",
                });
            }
        }
        // Other roles cannot delete
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Delete all image files from the server
        const galleryDir = path.join(__dirname, '../public/uploads/galleries', `gallery-${galleryId}`);
        
        if (fs.existsSync(galleryDir)) {
            try {
                // Delete all files in the directory first
                const files = fs.readdirSync(galleryDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(galleryDir, file));
                }
                // Then remove the directory
                fs.rmdirSync(galleryDir);
                console.log(`Deleted gallery directory: ${galleryDir}`);
            } catch (err) {
                console.error(`Failed to delete gallery directory: ${err.message}`);
                // Continue with deletion from database even if file deletion fails
            }
        }

        // Delete gallery and associated images from database
        // (GalleryImage records will be automatically deleted due to onDelete: Cascade)
        await prisma.gallery.delete({
            where: { id: galleryId }
        });

        res.status(200).json({
            success: true,
            message: "Gallery and all associated images deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Change Gallery Status (for SuperAdmin)
const changeGalleryStatus = async (req, res) => {
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
                message: "Access denied. Only SuperAdmin can change gallery status.",
            });
        }

        // Check if gallery exists
        const existingGallery = await prisma.gallery.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingGallery) {
            return res.status(404).json({
                success: false,
                message: `Gallery with id: ${id} not found`,
            });
        }

        // Update status
        const updatedGallery = await prisma.gallery.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: `Gallery status changed to ${status} successfully`,
            data: updatedGallery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Public Galleries (for all users)
const getPublicGallerys = async (req, res) => {
    try {
        // Only fetch APPROVED galleries
        const galleries = await prisma.gallery.findMany({
            where: {
                status: 'APPROVED'
            },
            include: {
                images: {
                    where: {
                        isThumbnail: true
                    },
                    take: 1
                },
                author: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format the response to include thumbnail
        const formattedGalleries = galleries.map(gallery => ({
            id: gallery.id,
            title: gallery.title,
            thumbnail: gallery.images[0]?.imageUrl || null,
            createdAt: gallery.createdAt,
            author: gallery.author.name
        }));

        res.status(200).json({
            success: true,
            data: formattedGalleries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Upload Image to a gallery
const uploadImage = async (req, res) => {
    try {
        const { galleryId } = req.body;
        
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

        // Check if gallery exists
        const gallery = await prisma.gallery.findUnique({
            where: { id: parseInt(galleryId) },
            include: { images: true }
        });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        // Check if user has permission to add images to this gallery
        if (user.role === 'ADMIN' && (gallery.createdBy !== req.userId || gallery.status === 'APPROVED')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Cannot add images to an approved gallery or another admin's gallery.",
            });
        }

        // Process file upload
        if (!req.file) {
            return res.status(400).json({
                success: false, 
                message: "No file uploaded"
            });
        }

        // Ensure gallery directory exists
        const galleryDir = await ensureGalleryDir(galleryId);
        
        // Move processed image to gallery directory with original name
        const sourceFile = req.file.path;
        const destFile = path.join(galleryDir, req.file.filename);
        
        fs.copyFileSync(sourceFile, destFile);
        
        try {
            // Remove the original file from the general uploads directory
            fs.unlinkSync(sourceFile);
        } catch (err) {
            console.log(`Could not delete source file: ${err.message}`);
            // Continue even if deletion fails
        }

        // Determine if this should be the thumbnail (first image is default thumbnail)
        const isThumbnail = gallery.images.length === 0;

        // Use absolute URL for the image path
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const imageUrl = `${baseUrl}/uploads/galleries/gallery-${galleryId}/${req.file.filename}`;

        // Save image information to database
        const image = await prisma.galleryImage.create({
            data: {
                galleryId: parseInt(galleryId),
                imageUrl: imageUrl,
                isThumbnail: isThumbnail
            }
        });

        // Get info about optimized file (with error handling)
        let fileSizeInMB = "unknown";
        try {
            if (fs.existsSync(destFile)) {
                const fileSizeInBytes = fs.statSync(destFile).size;
                fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            }
        } catch (error) {
            console.error("Error getting file size:", error);
        }

        res.status(200).json({
            success: true,
            message: "Image uploaded and added to gallery successfully",
            data: { 
                imageId: image.id,
                imageUrl,
                isThumbnail,
                format: 'webp', 
                size: `${fileSizeInMB}MB`
            }
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during file upload",
            error: error.message
        });
    }
};

// Set an image as the gallery thumbnail
const setThumbnail = async (req, res) => {
    try {
        const { galleryId, imageId } = req.params;
        
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

        // Check if gallery exists
        const gallery = await prisma.gallery.findUnique({
            where: { id: parseInt(galleryId) }
        });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        // Check if user has permission to modify this gallery
        if (user.role === 'ADMIN' && (gallery.createdBy !== req.userId || gallery.status === 'APPROVED')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Cannot modify an approved gallery or another admin's gallery.",
            });
        }

        // Check if image exists and belongs to this gallery
        const image = await prisma.galleryImage.findFirst({
            where: { 
                id: parseInt(imageId),
                galleryId: parseInt(galleryId)
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found in this gallery",
            });
        }

        // Update all images to set isThumbnail to false
        await prisma.galleryImage.updateMany({
            where: { 
                galleryId: parseInt(galleryId),
                isThumbnail: true
            },
            data: { isThumbnail: false }
        });

        // Set the selected image as thumbnail
        const updatedImage = await prisma.galleryImage.update({
            where: { id: parseInt(imageId) },
            data: { isThumbnail: true }
        });

        res.status(200).json({
            success: true,
            message: "Thumbnail set successfully",
            data: updatedImage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete an image from a gallery
const deleteImage = async (req, res) => {
    try {
        const { galleryId, imageId } = req.params;
        
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

        // Check if gallery exists
        const gallery = await prisma.gallery.findUnique({
            where: { id: parseInt(galleryId) },
            include: { images: true }
        });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        // Check if user has permission to modify this gallery
        if (user.role === 'ADMIN' && (gallery.createdBy !== req.userId || gallery.status === 'APPROVED')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Cannot modify an approved gallery or another admin's gallery.",
            });
        }

        // Find the image to delete
        const image = await prisma.galleryImage.findFirst({
            where: { 
                id: parseInt(imageId),
                galleryId: parseInt(galleryId)
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found in this gallery",
            });
        }

        // Delete the image file from the server
        const filename = extractFilename(image.imageUrl);
        const filePath = path.join(__dirname, '../public/uploads/galleries', `gallery-${galleryId}`, filename);
        
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete image file: ${err.message}`);
                // Continue with database deletion even if file deletion fails
            }
        }

        // Delete the image record from database
        await prisma.galleryImage.delete({
            where: { id: parseInt(imageId) }
        });

        // If deleted image was thumbnail and there are other images, set a new thumbnail
        if (image.isThumbnail && gallery.images.length > 1) {
            const newThumbnailImage = gallery.images.find(img => img.id !== parseInt(imageId));
            if (newThumbnailImage) {
                await prisma.galleryImage.update({
                    where: { id: newThumbnailImage.id },
                    data: { isThumbnail: true }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Image deleted successfully"
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
    createGallery,
    getAllGallerys,
    getAllPendingGallerys,
    getUserGallerys,
    getGalleryById,
    updateGallery,
    deleteGallery,
    changeGalleryStatus,
    getPublicGallerys,
    uploadImage,
    setThumbnail,
    deleteImage
};