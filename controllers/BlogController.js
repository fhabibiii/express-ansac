const express = require("express");
const { validationResult } = require("express-validator");
const prisma = require("../prisma/client");

// Create Blog
const createBlog = async (req, res) => {
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

        const { title, content, imageUrl } = req.body;
        
        // Simple alternative for the validation check
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image URL is required. Please upload an image first.",
            });
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                imageUrl,
                content,
                createdBy: req.userId,
                status: "PENDING" // Default status
            }
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Blogs for Admin and SuperAdmin
const getAllBlogs = async (req, res) => {
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

        let whereClause = {};
        
        // If admin, only show blogs with PENDING/REJECTED status
        // Even if they created an APPROVED blog, they shouldn't see it
        if (user.role === 'ADMIN') {
            whereClause = {
                OR: [
                    // Show blogs created by this admin that are PENDING or REJECTED
                    {
                        AND: [
                            { createdBy: req.userId },
                            { status: { in: ['PENDING', 'REJECTED'] } }
                        ]
                    },
                    // Show all PENDING/REJECTED blogs (regardless of creator)
                    { status: { in: ['PENDING', 'REJECTED'] } }
                ]
            };
        }

        const blogs = await prisma.blog.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                imageUrl: true,
                content: true,
                status: true,
                createdAt: true,
                updatedAt: true,
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

        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Blog by ID
const getBlogById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validate that id is a number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID format",
            });
        }
        
        const blog = await prisma.blog.findUnique({
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

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: `Blog with id: ${id} not found`,
            });
        }

        // Check permissions based on role and status
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role === 'USER_SELF' || user.role === 'USER_PARENT') {
            // Regular users can only see APPROVED blogs
            if (blog.status !== 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        } else if (user.role === 'ADMIN') {
            // Admins can see their own blogs or PENDING/REJECTED blogs
            if (blog.createdBy !== req.userId && blog.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        }
        // SuperAdmin can see all blogs

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Blog
const updateBlog = async (req, res) => {
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
        const { title, content, imageUrl } = req.body;

        // Check if blog exists
        const existingBlog = await prisma.blog.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: `Blog with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role === 'ADMIN') {
            // Admins can only update their own blogs with status PENDING or REJECTED
            if (existingBlog.createdBy !== req.userId || existingBlog.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot edit an approved blog or another admin's blog.",
                });
            }
        } else if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Update blog
        const updatedBlog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: {
                title: title || existingBlog.title,
                imageUrl: imageUrl || existingBlog.imageUrl,
                content: content || existingBlog.content,
            }
        });

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if blog exists
        const existingBlog = await prisma.blog.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: `Blog with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role === 'ADMIN') {
            // Admins can only delete their own blogs with status PENDING or REJECTED
            if (existingBlog.createdBy !== req.userId || existingBlog.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot delete an approved blog or another admin's blog.",
                });
            }
        } else if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Delete blog
        await prisma.blog.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Change Blog Status (for SuperAdmin)
const changeBlogStatus = async (req, res) => {
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
                message: "Access denied. Only SuperAdmin can change blog status.",
            });
        }

        // Check if blog exists
        const existingBlog = await prisma.blog.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: `Blog with id: ${id} not found`,
            });
        }

        // Update status
        const updatedBlog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: `Blog status changed to ${status} successfully`,
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Public Blogs (for all users)
const getPublicBlogs = async (req, res) => {
    try {
        // Only fetch APPROVED blogs
        const blogs = await prisma.blog.findMany({
            where: {
                status: 'APPROVED'
            },
            select: {
                id: true,
                title: true,
                imageUrl: true,
                content: true,
                createdAt: true,
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

        res.status(200).json({
            success: true,
            data: blogs
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

        // Use absolute URL instead of relative path
        // This assumes you have a BASE_URL environment variable or configuration
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // Replace with your actual backend URL
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: { imageUrl }
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
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    changeBlogStatus,
    getPublicBlogs,
    uploadImage
};