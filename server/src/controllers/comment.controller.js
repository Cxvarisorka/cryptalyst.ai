const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const notificationService = require('../services/notification.service');

/**
 * COMMENT CONTROLLER
 * Handles all comment-related operations
 */

/* ------------------------------------
 * VALIDATION RULES
 * ---------------------------------- */
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

/* ------------------------------------
 * CREATE COMMENT
 * POST /api/posts/:postId/comments
 * ---------------------------------- */
const createComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      content,
      parentCommentId: parentCommentId || null,
    });

    await comment.populate('userId', 'name avatar email');

    // Notify post owner only for top-level comments
    if (!parentCommentId) {
      const post = await Post.findById(postId).select('userId');
      if (post?.userId) {
        notificationService
          .createCommentNotification(req.user._id, post.userId, postId, comment._id)
          .catch((err) => console.error('Notification error:', err));
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    next(error);
  }
};

/* ------------------------------------
 * GET COMMENTS BY POST
 * GET /api/posts/:postId/comments
 * ---------------------------------- */
const getCommentsByPost = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      userId: req.user?._id || null,
      includeReplies: req.query.includeReplies !== 'false',
    };

    const response = await Comment.getCommentsForPost(req.params.postId, options);

    return res.status(200).json({
      success: true,
      data: response.comments,
      pagination: response.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------
 * UPDATE COMMENT
 * PATCH /api/comments/:id
 * ---------------------------------- */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this comment',
      });
    }

    comment.content = req.body.content?.trim() || comment.content;
    await comment.save();
    await comment.populate('userId', 'name avatar email');

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------
 * DELETE COMMENT
 * DELETE /api/comments/:id
 * ---------------------------------- */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this comment',
      });
    }

    // Delete replies
    await Comment.deleteMany({ parentCommentId: comment._id });

    // Delete main comment
    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------
 * GET REPLIES FOR A COMMENT
 * GET /api/comments/:id/replies
 * ---------------------------------- */
const getReplies = async (req, res, next) => {
  try {
    let replies = await Comment.find({
      parentCommentId: req.params.id,
      isHidden: false,
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatar email')
      .lean();

    // Like status for logged in users
    if (req.user?._id) {
      const Like = require('../models/like.model');

      const replyIds = replies.map((r) => r._id);

      const liked = await Like.find({
        userId: req.user._id,
        commentId: { $in: replyIds },
      }).select('commentId');

      const likedSet = new Set(liked.map((l) => l.commentId.toString()));

      replies = replies.map((reply) => ({
        ...reply,
        isLikedByUser: likedSet.has(reply._id.toString()),
      }));
    }

    return res.status(200).json({
      success: true,
      data: replies,
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------
 * EXPORT
 * ---------------------------------- */
module.exports = {
  createComment,
  createCommentValidation,
  getCommentsByPost,
  updateComment,
  deleteComment,
  getReplies,
};
