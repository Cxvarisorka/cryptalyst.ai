const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { uploadMultiple, handleMulterError } = require('../middleware/upload.middleware');

/**
 * Post Routes
 * All routes for post operations
 */

// Public routes (with optional auth to check like status for logged-in users)
router.get('/feed', optionalAuth, postController.getFeed); // Get feed posts
router.get('/feed/following', protect, postController.getFollowingFeed); // Get following feed (requires auth)
router.get('/search', optionalAuth, postController.searchPosts); // Search posts
router.get('/asset/:symbol', optionalAuth, postController.getPostsByAsset); // Get posts by asset
router.get('/user/:userId', optionalAuth, postController.getPostsByUser); // Get posts by user
router.get('/:id', optionalAuth, postController.getPostById); // Get single post

// Middleware to parse JSON fields from multipart form data
const parseMultipartJSON = (req, res, next) => {
  try {
    // Parse JSON fields if multipart/form-data
    if (req.body.asset && typeof req.body.asset === 'string') {
      req.body.asset = JSON.parse(req.body.asset);
    }
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in form data',
      error: error.message,
    });
  }
};

// Protected routes (require authentication)
router.post(
  '/',
  protect,
  uploadMultiple,
  handleMulterError,
  parseMultipartJSON,
  postController.createPostValidation,
  postController.createPost
); // Create post with images

router.patch('/:id', protect, postController.updatePost); // Update post
router.delete('/:id', protect, postController.deletePost); // Delete post
router.post('/:id/share', postController.sharePost); // Increment share count
router.post('/:id/repost', protect, postController.repostPost); // Create repost (share to timeline)

module.exports = router;
