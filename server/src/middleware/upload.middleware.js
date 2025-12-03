const multer = require('multer');

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Max number of files per upload
const MAX_FILES = 4;

// File filter to validate image uploads
const fileFilter = (req, file, cb) => {
  console.log('Multer - File filter:', {
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    console.log('Multer - File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.error('Multer - File rejected:', file.originalname, file.mimetype);
    cb(
      new Error(
        `Invalid file type. Only ${ALLOWED_FILE_TYPES.join(', ')} are allowed.`
      ),
      false
    );
  }
};

// Configure multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
});

// Middleware to upload single image
const uploadSingle = upload.single('image');

// Middleware to upload multiple images
const uploadMultiple = upload.array('images', MAX_FILES);

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: `Too many files. Maximum is ${MAX_FILES} files`,
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name',
        });
    }
  }

  if (err?.message?.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  handleMulterError,
  MAX_FILES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
};
