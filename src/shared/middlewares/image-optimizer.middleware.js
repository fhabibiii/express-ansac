/**
 * Image optimization middleware
 * Automatically optimizes uploaded images for better performance
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger.utils');

/**
 * Optimize image middleware - processes images after they've been uploaded
 * @param {Object} options - Configuration options
 * @param {number} options.width - Maximum width to resize image to (default: 1200)
 * @param {number} options.quality - JPEG/WebP quality (0-100) (default: 80)
 * @param {boolean} options.convertToWebp - Whether to convert images to webp (default: true)
 */
const optimizeImage = (options = {}) => {
  const {
    width = 1200,
    quality = 80,
    convertToWebp = true
  } = options;

  return async (req, res, next) => {
    try {
      // Skip if no file was uploaded or multiple files (handled separately)
      if (!req.file) {
        return next();
      }

      const filePath = req.file.path;
      const fileExt = path.extname(filePath).toLowerCase();
      
      // Only process image files
      const validImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!validImageExts.includes(fileExt)) {
        return next();
      }

      logger.info(`Optimizing image: ${filePath}`);
      
      // Create Sharp instance for the uploaded image
      let sharpImage = sharp(filePath);
      
      // Get image metadata
      const metadata = await sharpImage.metadata();
      
      // Only resize if the image is larger than target width
      if (metadata.width > width) {
        sharpImage = sharpImage.resize({
          width,
          withoutEnlargement: true,
        });
      }
      
      let outputPath = filePath;
      // Convert to WebP if requested
      if (convertToWebp && fileExt !== '.webp') {
        // Change the file extension to .webp
        outputPath = filePath.replace(fileExt, '.webp');
        
        // Update the req.file object to reflect the new path and mimetype
        req.file.path = outputPath;
        req.file.mimetype = 'image/webp';
        req.file.filename = req.file.filename.replace(fileExt, '.webp');
        
        // Process and save as WebP
        await sharpImage
          .webp({ quality })
          .toFile(outputPath);
          
        // Remove the original file
        fs.unlinkSync(filePath);
        
        logger.info(`Converted and optimized image: ${outputPath}`);
      } else {
        // Process and overwrite the original
        if (fileExt === '.jpg' || fileExt === '.jpeg') {
          await sharpImage.jpeg({ quality }).toBuffer()
            .then(buffer => fs.writeFileSync(filePath, buffer));
        } else if (fileExt === '.png') {
          await sharpImage.png({ quality }).toBuffer()
            .then(buffer => fs.writeFileSync(filePath, buffer));
        } else if (fileExt === '.webp') {
          await sharpImage.webp({ quality }).toBuffer()
            .then(buffer => fs.writeFileSync(filePath, buffer));
        }
        
        logger.info(`Optimized image: ${filePath}`);
      }
      
      next();
    } catch (error) {
      logger.error('Image optimization error:', error);
      next(error);
    }
  };
};

/**
 * Optimize multiple images (works with multer array upload)
 */
const optimizeMultipleImages = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Skip if no files were uploaded
      if (!req.files || req.files.length === 0) {
        return next();
      }
      
      // Create an array of promises for each file
      const optimizationPromises = req.files.map(async (file) => {
        const filePath = file.path;
        const fileExt = path.extname(filePath).toLowerCase();
        
        // Only process image files
        const validImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!validImageExts.includes(fileExt)) {
          return;
        }
        
        // Process similar to the single file version
        // Implement optimization logic for each file...
        // (Similar logic as in optimizeImage middleware)
      });
      
      // Wait for all optimizations to complete
      await Promise.all(optimizationPromises);
      
      next();
    } catch (error) {
      logger.error('Multiple image optimization error:', error);
      next(error);
    }
  };
};

module.exports = {
  optimizeImage,
  optimizeMultipleImages
};