const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

/**
 * Comment Routes
 * Handles comment operations for posts
 */

// Get comments for a post (public with optional auth for like status)
router.get('/posts/:postId/comments', optionalAuth, commentController.getCommentsByPost);

// Get replies for a comment (public)
router.get('/comments/:id/replies', optionalAuth, commentController.getReplies);

// Protected routes (require authentication)
router.post(
  '/posts/:postId/comments',
  protect,
  commentController.createCommentValidation,
  commentController.createComment
);

router.patch('/comments/:id', protect, commentController.updateComment);
router.delete('/comments/:id', protect, commentController.deleteComment);

module.exports = router;
