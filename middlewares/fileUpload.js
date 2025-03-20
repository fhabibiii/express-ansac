const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { setTimeout: sleep } = require('timers/promises');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create services directory if it doesn't exist
const servicesDir = path.join(__dirname, '../public/uploads/services');
if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
}

// Set proper permissions for Linux/Unix systems
if (fs.existsSync(uploadsDir) && process.platform !== 'win32') {
    try {
        fs.chmodSync(uploadsDir, 0o755); // rwxr-xr-x permissions
    } catch (err) {
        console.error(`Unable to set permissions on uploads directory: ${err.message}`);
    }
}

// Create temp directory inside uploads if it doesn't exist
const tempDir = path.join(uploadsDir, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Set permissions for temp directory on Linux/Unix
    if (process.platform !== 'win32') {
        try {
            fs.chmodSync(tempDir, 0o755);
        } catch (err) {
            console.error(`Unable to set permissions on temp directory: ${err.message}`);
        }
    }
}

// Clean up any leftover files from previous runs
fs.readdir(tempDir, (err, files) => {
    if (err) {
        console.error(`Error reading temp directory: ${err.message}`);
        return;
    }
    
    if (files.length > 0) {
        console.log(`Found ${files.length} leftover temp files from previous runs, cleaning up`);
        
        // Try multiple deletion strategies on startup
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            
            try {
                // Try direct deletion first
                fs.unlinkSync(filePath);
                console.log(`Startup cleanup: deleted ${file}`);
            } catch (err1) {
                try {
                    // On Windows, try an alternative method by renaming first
                    if (process.platform === 'win32') {
                        const tempName = path.join(tempDir, `__temp_${Date.now()}`);
                        fs.renameSync(filePath, tempName);
                        fs.unlinkSync(tempName);
                        console.log(`Startup cleanup: deleted ${file} using rename strategy`);
                    } else {
                        throw err1;
                    }
                } catch (err2) {
                    console.error(`Startup cleanup: could not delete ${file}: ${err2.message}`);
                }
            }
        });
    }
});

// Update the storage configuration:
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check URL path to determine the correct destination
        if (req.originalUrl.includes('/service/upload-image')) {
            cb(null, servicesDir);
        } else {
            cb(null, tempDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to restrict to images only
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed! (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Create the multer instance
const multerUpload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size for original upload
    }
});

// For Windows systems only - track files that couldn't be deleted immediately
if (!global.tempFilesToDelete) {
    global.tempFilesToDelete = {};
}

// Function to track a file for later deletion (Windows fallback)
const safeDeleteFile = (filePath) => {
    const fileId = path.basename(filePath);
    global.tempFilesToDelete[fileId] = {
        path: filePath,
        addedAt: Date.now(),
        attempts: 0,
        nextAttempt: Date.now() + 30000
    };
};

// Windows-specific cleanup process
if (process.platform === 'win32') {
    setInterval(async () => {
        const fileIds = Object.keys(global.tempFilesToDelete);
        if (fileIds.length === 0) return;
        
        console.log(`Checking ${fileIds.length} pending files...`);
        for (const fileId of fileIds) {
            const fileInfo = global.tempFilesToDelete[fileId];
            
            // Skip if file doesn't exist
            if (!fs.existsSync(fileInfo.path)) {
                delete global.tempFilesToDelete[fileId];
                continue;
            }
            
            // Try to delete the file
            try {
                if (global.gc) global.gc();
                fs.unlinkSync(fileInfo.path);
                console.log(`Successfully deleted: ${fileInfo.path}`);
                delete global.tempFilesToDelete[fileId];
            } catch (err) {
                // Check if it's a JPEG file
                const isJpegFile = /\.(jpg|jpeg)$/i.test(fileInfo.path);
                
                // For JPEG files, only try a few times then stop retrying
                if (isJpegFile) {
                    fileInfo.attempts++;
                    
                    // Only retry JPEGs 3 times max, then log and stop trying
                    if (fileInfo.attempts >= 3) {
                        console.log(`Giving up on locked JPEG file after ${fileInfo.attempts} attempts: ${fileInfo.path}`);
                        delete global.tempFilesToDelete[fileId];
                    } else {
                        // Still within retry limit
                        const delayMs = 5 * 60 * 1000; // Fixed 5 minute delay between attempts
                        fileInfo.nextAttempt = Date.now() + delayMs;
                        console.log(`JPEG file locked, attempt ${fileInfo.attempts}/3, will retry in 5 minutes: ${fileInfo.path}`);
                    }
                } else {
                    // For non-JPEG files, continue with existing strategy
                    fileInfo.attempts++;
                    const delayMs = Math.min(5 * 60 * 1000 * fileInfo.attempts, 30 * 60 * 1000);
                    fileInfo.nextAttempt = Date.now() + delayMs;
                }
            }
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
}

// Update the processImage middleware
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    let originalFilePath = null;

    try {
        originalFilePath = req.file.path;
        // Check if the file is a JPG/JPEG
        const isJpegFile = /\.(jpg|jpeg)$/i.test(originalFilePath);
        
        // Determine the output directory based on the request path
        let outputDir = uploadsDir;
        if (req.originalUrl.includes('/service/upload-image')) {
            outputDir = servicesDir;
        }
        
        // Generate a unique output filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const outputFilename = `image-${uniqueSuffix}.webp`;
        const outputPath = path.join(outputDir, outputFilename);

        // Process the image with sharp
        await sharp(originalFilePath, { failOnError: false })
            .webp({ 
                quality: 80,
                lossless: false
            })
            .resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(outputPath);

        // Update the req.file to point to the processed file
        req.file.filename = outputFilename;
        req.file.path = outputPath;
        req.file.mimetype = 'image/webp';

        // On Windows with JPG/JPEG files, don't try to delete immediately
        if (process.platform === 'win32' && isJpegFile) {
            console.log(`JPG/JPEG file on Windows - scheduling for delayed cleanup: ${originalFilePath}`);
            safeDeleteFile(originalFilePath);
        } else {
            // For other file types or other OS, try immediate deletion with a small delay
            await sleep(100);
            try {
                if (fs.existsSync(originalFilePath)) {
                    fs.unlinkSync(originalFilePath);
                    console.log(`Deleted temp file: ${originalFilePath}`);
                }
            } catch (deleteError) {
                if (process.platform === 'win32') {
                    console.log(`Deletion failed, scheduling for cleanup: ${deleteError.message}`);
                    safeDeleteFile(originalFilePath);
                } else {
                    console.error(`Failed to delete temp file: ${deleteError.message}`);
                }
            }
        }

        next();
    } catch (error) {
        console.error("Image processing error:", error);
        
        // Clean up on error
        if (originalFilePath && fs.existsSync(originalFilePath)) {
            try {
                fs.unlinkSync(originalFilePath);
            } catch (err) {
                if (process.platform === 'win32') {
                    safeDeleteFile(originalFilePath);
                }
            }
        }
        
        next(error);
    }
};

// Combined middleware for upload and processing
const upload = {
    single: (fieldName) => {
        return [
            multerUpload.single(fieldName),
            processImage
        ];
    }
};

// Unix-specific temp cleanup (more aggressive because file locking is less of an issue)
if (process.platform !== 'win32') {
    setInterval(() => {
        fs.readdir(tempDir, (err, files) => {
            if (err || files.length === 0) return;
            
            files.forEach(file => {
                try {
                    const filePath = path.join(tempDir, file);
                    const stats = fs.statSync(filePath);
                    const fileAgeInMinutes = (Date.now() - stats.mtime) / (1000 * 60);
                    
                    if (fileAgeInMinutes > 5) {
                        fs.unlinkSync(filePath);
                        console.log(`Cleaned up old temp file: ${filePath}`);
                    }
                } catch (err) {
                    // Ignore errors
                }
            });
        });
    }, 30 * 60 * 1000); // Every 30 minutes
}

// Replace the existing process.on('SIGINT') handler
process.on('SIGINT', function() {
    console.log('Server shutting down, performing final cleanup...');
    
    // Immediate shutdown - don't wait for file operations
    process.exit(0);
});

module.exports = upload;