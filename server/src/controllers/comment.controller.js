const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const notificationService = require('../services/notification.service');

/**
 * Comment Controller
 * Handles HTTP requests for comment operations
 */

/**
 * Validation rules for creating a comment
 */
const createCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
  body('parentCommentId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid parent comment ID'),
];

/**
 * Create a new comment
 * POST /api/posts/:postId/comments
 */
const createComment = async (req, res, next) => {
  try {
    console.log('Comment request received:', {
      postId: req.params.postId,
      body: req.body,
      userId: req.user?._id
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Comment validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    console.log('Creating comment - Post ID:', req.params.postId, 'User ID:', req.user._id);

    const comment = new Comment({
      postId: req.params.postId,
      userId: req.user._id,
      content: req.body.content,
      parentCommentId: req.body.parentCommentId || null,
    });

    await comment.save();
    await comment.populate('userId', 'name avatar email');

    console.log('Comment created successfully:', comment._id);

    // Get post owner for notification (only for top-level comments)
    if (!req.body.parentCommentId) {
      const post = await Post.findById(req.params.postId).select('userId').lean();
      if (post && post.userId) {
        // Create notification (runs async, don't wait)
        notificationService.createCommentNotification(
          req.user._id,
          post.userId,
          req.params.postId,
          comment._id
        ).catch(err => {
          console.error('Error creating comment notification:', err);
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    next(error);
  }
};

/**
 * Get comments for a post
 * GET /api/posts/:postId/comments
 */
const getCommentsByPost = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      includeReplies: req.query.includeReplies !== 'false',
      userId: req.user?._id || null, // Pass user ID for like status
    };

    const result = await Comment.getCommentsForPost(
      req.params.postId,
      options
    );

    res.status(200).json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a comment
 * PATCH /api/comments/:id
 */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check authorization
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this comment',
      });
    }

    comment.content = req.body.content || comment.content;
    await comment.save();
    await comment.populate('userId', 'name avatar email');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment
 * DELETE /api/comments/:id
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check authorization
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this comment',
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentCommentId: comment._id });

    // Delete the comment
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get replies for a comment
 * GET /api/comments/:id/replies
 */
const getReplies = async (req, res, next) => {
  try {
    const replies = await Comment.find({
      parentCommentId: req.params.id,
      isHidden: false,
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatar email')
      .lean();

    res.status(200).json({
      success: true,
      data: replies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  createCommentValidation,
  getCommentsByPost,
  updateComment,
  deleteComment,
  getReplies,
};
