/**
 * Upload Middleware
 * Handles file uploads with multer
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger.utils');
const { optimizeImage: imageOptimizer } = require('./image-optimizer.middleware');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../../public/uploads');
const blogUploadsDir = path.join(uploadsDir, 'blog');
const galleryUploadsDir = path.join(uploadsDir, 'gallery');
const serviceUploadsDir = path.join(uploadsDir, 'services');
const tempUploadsDir = path.join(uploadsDir, 'temp');

[uploadsDir, blogUploadsDir, galleryUploadsDir, serviceUploadsDir, tempUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// Enhanced security: sanitize filenames to prevent path traversal attacks
const sanitizeFilename = (filename) => {
  // Replace any path components with empty string
  const sanitized = filename.replace(/[/\\?%*:|"<>]/g, '');
  // Add a unique ID to prevent filename collisions and make filenames unpredictable
  const extension = path.extname(sanitized);
  const basename = path.basename(sanitized, extension);
  return `${basename}-${uuidv4().substring(0, 8)}${extension}`;
};

// Configure storage with enhanced security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Determine upload path based on route
    if (req.originalUrl.includes('/blog')) {
      uploadPath = blogUploadsDir;
    } else if (req.originalUrl.includes('/gallery')) {
      uploadPath = galleryUploadsDir;
    } else if (req.originalUrl.includes('/service')) {
      uploadPath = serviceUploadsDir;
    } else {
      // Use temp directory for any other uploads for security
      uploadPath = tempUploadsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const originalName = sanitizeFilename(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(originalName).toLowerCase() || '.' + file.mimetype.split('/')[1];
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Enhanced file filter with more secure MIME type checking
const fileFilter = (req, file, cb) => {
  // Accept images only with explicit MIME type check
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Rejected file upload: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
  }
};

// Configure multer with enhanced security
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Maximum number of files per request
  }
});

// Create middleware compositions for different upload scenarios
// Each combines the upload with image optimization
const uploadImageAndOptimize = [
  upload.single('image'),
  imageOptimizer({ width: 1200, quality: 80, convertToWebp: true })
];

const uploadImagesAndOptimize = [
  upload.array('images', 10),
  imageOptimizer({ width: 1200, quality: 80, convertToWebp: true })
];

const uploadBlogImageAndOptimize = [
  upload.single('blogImage'),
  imageOptimizer({ width: 1200, quality: 80, convertToWebp: true })
];

const uploadGalleryImageAndOptimize = [
  upload.single('galleryImage'),
  imageOptimizer({ width: 1200, quality: 80, convertToWebp: true })
];

const uploadServiceImageAndOptimize = [
  upload.single('serviceImage'),
  imageOptimizer({ width: 1200, quality: 80, convertToWebp: true })
];

// For backward compatibility and for routes that haven't been updated yet
const uploadImage = upload.single('image');
const uploadImages = upload.array('images', 10);
const uploadBlogImage = upload.single('blogImage');
const uploadGalleryImage = upload.single('galleryImage');
const uploadServiceImage = upload.single('serviceImage');

// Export both the optimized versions and the original ones
module.exports = {
  // New optimized middlewares (recommended)
  uploadImageAndOptimize,
  uploadImagesAndOptimize,
  uploadBlogImageAndOptimize,
  uploadGalleryImageAndOptimize,
  uploadServiceImageAndOptimize,
  
  // Original middlewares (for backward compatibility)
  uploadImage,
  uploadImages,
  uploadBlogImage,
  uploadGalleryImage,
  uploadServiceImage,
  
  // Legacy optimizeImage function (deprecated, use the new middlewares instead)
  optimizeImage: imageOptimizer({ width: 1200, quality: 80, convertToWebp: true })
};