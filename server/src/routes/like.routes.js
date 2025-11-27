const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Like Routes
 * Handles like/unlike operations for posts and comments
 */

// Post likes
router.post('/posts/:postId/like', protect, likeController.toggleLike);
router.get('/posts/:postId/like/status', likeController.getLikeStatus);
router.get('/posts/:postId/likes', likeController.getLikesForPost);

// Comment likes
router.post('/comments/:commentId/like', protect, likeController.toggleCommentLike);

module.exports = router;
