const multer = require('multer');

/**
 * Multer Upload Middleware
 * Handles file uploads with validation for image posts
 */

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Max number of files per upload
const MAX_FILES = 4;

/**
 * File filter to validate image uploads
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only ${ALLOWED_FILE_TYPES.join(', ')} are allowed.`
      ),
      false
    );
  }
};

/**
 * Configure multer with memory storage
 * Files are stored in memory as buffers for direct upload to Cloudinary
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
});

/**
 * Error handler for multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum is ${MAX_FILES} files`,
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name',
      });
    }
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

/**
 * Middleware to upload single image
 */
const uploadSingle = upload.single('image');

/**
 * Middleware to upload multiple images (for posts)
 */
const uploadMultiple = upload.array('images', MAX_FILES);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  handleMulterError,
  MAX_FILES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
};
