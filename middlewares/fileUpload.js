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
        files.forEach(file => {
            try {
                fs.unlinkSync(path.join(tempDir, file));
            } catch (error) {
                console.error(`Could not delete ${file}: ${error.message}`);
            }
        });
    }
});

// Configure storage for the original upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
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
        
        console.log(`Attempting to clean up ${fileIds.length} pending files...`);
        for (const fileId of fileIds) {
            const fileInfo = global.tempFilesToDelete[fileId];
            
            // Check if file exists before attempting to delete
            if (!fs.existsSync(fileInfo.path)) {
                delete global.tempFilesToDelete[fileId];
                continue;
            }
            
            // Try to delete the file
            try {
                // Force garbage collection if available (helps release file handles)
                if (global.gc) {
                    global.gc();
                }
                
                fs.unlinkSync(fileInfo.path);
                console.log(`Successfully deleted: ${fileInfo.path}`);
                delete global.tempFilesToDelete[fileId];
            } catch (err) {
                // If this is a JPEG file, we need to be more patient
                const isJpegFile = /\.(jpg|jpeg)$/i.test(fileInfo.path);
                if (isJpegFile) {
                    // Update next attempt time with longer delay for JPEGs
                    fileInfo.attempts++;
                    // Use a longer delay for JPEGs (2 minutes * attempt count)
                    const delayMs = 120000 * fileInfo.attempts;
                    fileInfo.nextAttempt = Date.now() + delayMs;
                    console.log(`JPEG file locked, will retry in ${delayMs/60000} minutes: ${fileInfo.path}`);
                }
                // Keep in queue for next attempt
            }
        }
    }, 2 * 60 * 1000); // Check every 2 minutes
}

// Middleware that processes the uploaded image with Sharp
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    let originalFilePath = null;

    try {
        originalFilePath = req.file.path;
        // Check if the file is a JPG/JPEG
        const isJpegFile = /\.(jpg|jpeg)$/i.test(originalFilePath);
        
        // Generate a unique output filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const outputFilename = `image-${uniqueSuffix}.webp`;
        const outputPath = path.join(uploadsDir, outputFilename);

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

module.exports = upload;