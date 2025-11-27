const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadMultiple, handleMulterError } = require('../middleware/upload.middleware');

/**
 * Post Routes
 * All routes for post operations
 */

// Public routes
router.get('/feed', postController.getFeed); // Get feed posts
router.get('/search', postController.searchPosts); // Search posts
router.get('/asset/:symbol', postController.getPostsByAsset); // Get posts by asset
router.get('/user/:userId', postController.getPostsByUser); // Get posts by user
router.get('/:id', postController.getPostById); // Get single post

// Protected routes (require authentication)
router.post(
  '/',
  protect,
  uploadMultiple,
  handleMulterError,
  postController.createPostValidation,
  postController.createPost
); // Create post

router.patch('/:id', protect, postController.updatePost); // Update post
router.delete('/:id', protect, postController.deletePost); // Delete post
router.post('/:id/share', postController.sharePost); // Increment share count

module.exports = router;
