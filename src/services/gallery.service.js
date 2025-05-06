/**
 * Gallery Service
 * Handles gallery-related business logic
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const prisma = require('../../prisma/client');
const { HTTP_STATUS } = require('../shared/constants/app.constants');

const mkdirAsync = promisify(fs.mkdir);

class GalleryService {
  /**
   * Ensure gallery directory exists
   * @param {number} galleryId - Gallery ID
   * @returns {Promise<string>} - Path to gallery directory
   */
  async ensureGalleryDir(galleryId) {
    const galleryDir = path.join(process.cwd(), 'public/uploads/galleries', `gallery-${galleryId}`);
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
  }

  /**
   * Create a new gallery
   * @param {Object} galleryData - Gallery data
   * @param {number} userId - ID of the creator
   * @param {string} userRole - Role of the creator
   * @returns {Promise<Object>} - Created gallery object
   */
  async createGallery(galleryData, userId, userRole) {
    // Check if user has admin/superadmin role
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const { title } = galleryData;
    
    // Create gallery without images initially
    const gallery = await prisma.gallery.create({
      data: {
        title,
        createdBy: userId,
        status: "PENDING" // Default status
      }
    });

    return gallery;
  }

  /**
   * Get all galleries (SuperAdmin only)
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Array>} - List of galleries
   */
  async getAllGalleries(userRole) {
    // Only SuperAdmin can access all galleries
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied. Only SuperAdmin can access all galleries.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
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
    return galleries.map(gallery => ({
      id: gallery.id,
      title: gallery.title,
      status: gallery.status,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      thumbnail: gallery.images[0]?.imageUrl || null,
      author: gallery.author
    }));
  }

  /**
   * Get all pending galleries (SuperAdmin only)
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Array>} - List of pending galleries
   */
  async getAllPendingGalleries(userRole) {
    // Only SuperAdmin can access pending galleries
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied. Only SuperAdmin can access pending galleries.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
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
    return galleries.map(gallery => ({
      id: gallery.id,
      title: gallery.title,
      status: gallery.status,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      thumbnail: gallery.images[0]?.imageUrl || null,
      author: gallery.author
    }));
  }

  /**
   * Get galleries created by the current user
   * @param {number} userId - ID of the user
   * @param {string} userRole - Role of the user
   * @returns {Promise<Array>} - List of user's galleries
   */
  async getUserGalleries(userId, userRole) {
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Filter to only show galleries created by this user
    const whereClause = {
      createdBy: userId
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
    return galleries.map(gallery => ({
      id: gallery.id,
      title: gallery.title,
      status: gallery.status,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      thumbnail: gallery.images[0]?.imageUrl || null,
      author: gallery.author
    }));
  }

  /**
   * Get gallery by ID
   * @param {number} id - Gallery ID
   * @param {number} userId - ID of the user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Gallery object with images
   */
  async getGalleryById(id, userId, userRole) {
    const gallery = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
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
      const error = new Error(`Gallery with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions based on role and status
    if (userRole === 'USER_SELF' || userRole === 'USER_PARENT') {
      // Regular users can only see APPROVED galleries
      if (gallery.status !== 'APPROVED') {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else if (userRole === 'ADMIN') {
      // Admins can see their own galleries or PENDING/REJECTED galleries
      if (gallery.createdBy !== userId && gallery.status === 'APPROVED') {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    }
    // SuperAdmin can see all galleries

    return gallery;
  }

  /**
   * Update gallery title
   * @param {number} id - Gallery ID
   * @param {string} title - New gallery title
   * @param {number} userId - ID of the user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated gallery
   */
  async updateGallery(id, title, userId, userRole) {
    // Check if gallery exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGallery) {
      const error = new Error(`Gallery with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'SUPERADMIN') {
      // SuperAdmin can edit any gallery - no restrictions
    } else if (userRole === 'ADMIN') {
      // Admins can only update their own galleries with status PENDING or REJECTED
      if (existingGallery.createdBy !== userId || existingGallery.status === 'APPROVED') {
        const error = new Error('Access denied. Cannot edit an approved gallery or another admin\'s gallery.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
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

    return {
      gallery: updatedGallery,
      statusChanged: existingGallery.status === 'REJECTED'
    };
  }

  /**
   * Extract filename from imageUrl
   * @param {string} imageUrl - URL of the image
   * @returns {string} - Filename
   */
  extractFilename(imageUrl) {
    // This handles both URLs with / and Windows paths with \
    const parts = imageUrl.split(/[\/\\]/);
    return parts[parts.length - 1];
  }

  /**
   * Delete gallery and all its images
   * @param {number} id - Gallery ID
   * @param {number} userId - ID of the user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<void>}
   */
  async deleteGallery(id, userId, userRole) {
    const galleryId = parseInt(id);
    
    // Check if gallery exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        images: true
      }
    });

    if (!existingGallery) {
      const error = new Error(`Gallery with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'SUPERADMIN') {
      // SuperAdmin can delete any gallery - no restrictions
    } else if (userRole === 'ADMIN') {
      // Admins can only delete their own galleries with status PENDING or REJECTED
      if (existingGallery.createdBy !== userId || existingGallery.status === 'APPROVED') {
        const error = new Error('Access denied. Cannot delete an approved gallery or another admin\'s gallery.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Delete all image files from the server
    const galleryDir = path.join(process.cwd(), 'public/uploads/galleries', `gallery-${galleryId}`);
    
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
  }

  /**
   * Change gallery status
   * @param {number} id - Gallery ID
   * @param {string} status - New status
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated gallery
   */
  async changeGalleryStatus(id, status, userRole) {
    // Check if user is SuperAdmin
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied. Only SuperAdmin can change gallery status.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Check if gallery exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGallery) {
      const error = new Error(`Gallery with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Update status
    const updatedGallery = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    return updatedGallery;
  }

  /**
   * Get public galleries
   * @returns {Promise<Array>} - List of public galleries
   */
  async getPublicGalleries() {
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
    return galleries.map(gallery => ({
      id: gallery.id,
      title: gallery.title,
      thumbnail: gallery.images[0]?.imageUrl || null,
      createdAt: gallery.createdAt,
      author: gallery.author.name
    }));
  }

  /**
   * Upload image to gallery
   * @param {number} galleryId - Gallery ID
   * @param {Object} file - Uploaded file object
   * @param {number} userId - ID of the user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Uploaded image information
   */
  async uploadGalleryImage(galleryId, file, userId, userRole) {
    // Check user permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: parseInt(galleryId) },
      include: { images: true }
    });

    if (!gallery) {
      const error = new Error('Gallery not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check if user has permission to add images to this gallery
    if (userRole === 'ADMIN' && (gallery.createdBy !== userId || gallery.status === 'APPROVED')) {
      const error = new Error('Access denied. Cannot add images to an approved gallery or another admin\'s gallery.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Process file upload
    if (!file) {
      const error = new Error('No file uploaded');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // Ensure gallery directory exists
    const galleryDir = await this.ensureGalleryDir(galleryId);
    
    // Move processed image to gallery directory with original name
    const sourceFile = file.path;
    const destFile = path.join(galleryDir, file.filename);
    
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
    const imageUrl = `${baseUrl}/uploads/galleries/gallery-${galleryId}/${file.filename}`;

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

    return { 
      imageId: image.id,
      imageUrl,
      isThumbnail,
      format: 'webp', 
      size: `${fileSizeInMB}MB`
    };
  }

  /**
   * Set an image as the gallery thumbnail
   * @param {number} galleryId - Gallery ID
   * @param {number} imageId - Image ID
   * @param {number} userId - ID of the user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated image
   */
  async setThumbnail(galleryId, imageId, userId, userRole) {
    // Check user permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: parseInt(galleryId) }
    });

    if (!gallery) {
      const error = new Error('Gallery not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check if user has permission to modify this gallery
    if (userRole === 'ADMIN' && (gallery.createdBy !== userId || gallery.status === 'APPROVED')) {
      const error = new Error('Access denied. Cannot modify an approved gallery or another admin\'s gallery.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Check if image exists and belongs to this gallery
    const image = await prisma.galleryImage.findFirst({
      where: { 
        id: parseInt(imageId),
        galleryId: parseInt(galleryId)
      }
    });

    if (!image) {
      const error = new Error('Image not found in this gallery');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
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

    return updatedImage;
  }

  /**
   * Delete an image from a gallery
   * @param {number} galleryId - Gallery ID
   * @param {number} imageId - Image ID
   * @param {number} userId - ID of the user making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<void>}
   */
  async deleteImage(galleryId, imageId, userId, userRole) {
    // Check user permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: parseInt(galleryId) },
      include: { images: true }
    });

    if (!gallery) {
      const error = new Error('Gallery not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check if user has permission to modify this gallery
    if (userRole === 'ADMIN' && (gallery.createdBy !== userId || gallery.status === 'APPROVED')) {
      const error = new Error('Access denied. Cannot modify an approved gallery or another admin\'s gallery.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Find the image to delete
    const image = await prisma.galleryImage.findFirst({
      where: { 
        id: parseInt(imageId),
        galleryId: parseInt(galleryId)
      }
    });

    if (!image) {
      const error = new Error('Image not found in this gallery');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Delete the image file from the server
    const filename = this.extractFilename(image.imageUrl);
    const filePath = path.join(process.cwd(), 'public/uploads/galleries', `gallery-${galleryId}`, filename);
    
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
  }
}

module.exports = new GalleryService();