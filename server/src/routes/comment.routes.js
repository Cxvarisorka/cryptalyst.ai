const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Comment Routes
 * Handles comment operations for posts
 */

// Get comments for a post (public)
router.get('/posts/:postId/comments', commentController.getCommentsByPost);

// Get replies for a comment (public)
router.get('/comments/:id/replies', commentController.getReplies);

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
