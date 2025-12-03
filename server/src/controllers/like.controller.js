const Like = require('../models/like.model');
const Post = require('../models/post.model');
const notificationService = require('../services/notification.service');

/**
 * Like Controller
 * Handles HTTP requests for like operations
 */

/**
 * Toggle like on a post
 * POST /api/posts/:postId/like
 */
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Check if like exists - use lean() for faster query
    const existingLike = await Like.findOne({ postId, userId }).lean();

    if (existingLike) {
      // Unlike: Remove the like
      await Like.findByIdAndDelete(existingLike._id);

      return res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        data: { liked: false },
      });
    } else {
      // Like: Create new like
      const like = new Like({ postId, userId });
      await like.save();

      // Get post owner for notification
      const post = await Post.findById(postId).select('userId').lean();
      if (post && post.userId) {
        // Create notification (runs async, don't wait)
        notificationService.createLikeNotification(userId, post.userId, postId).catch(err => {
          console.error('Error creating like notification:', err);
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Post liked successfully',
        data: { liked: true },
      });
    }
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Post already liked',
        data: { liked: true },
      });
    }
    console.error('Error toggling like:', error);
    next(error);
  }
};

/**
 * Check if user has liked a post
 * GET /api/posts/:postId/like/status
 */
const getLikeStatus = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(200).json({
        success: true,
        data: { liked: false },
      });
    }

    const liked = await Like.hasUserLikedPost(userId, postId);

    res.status(200).json({
      success: true,
      data: { liked },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users who liked a post
 * GET /api/posts/:postId/likes
 */
const getLikesForPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await Like.getLikesForPost(postId, options);

    res.status(200).json({
      success: true,
      data: result.likes,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle like on a comment
 * POST /api/comments/:commentId/like
 */
const toggleCommentLike = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    console.log('Toggle comment like - Comment ID:', commentId, 'User ID:', userId);

    // Check if like exists - use lean() for faster query
    const existingLike = await Like.findOne({ commentId, userId }).lean();

    if (existingLike) {
      // Unlike: Remove the like
      console.log('Unlike comment - removing existing like:', existingLike._id);
      await Like.findByIdAndDelete(existingLike._id);

      return res.status(200).json({
        success: true,
        message: 'Comment unliked successfully',
        data: { liked: false },
      });
    } else {
      // Like: Create new like (need to find the postId from comment)
      const Comment = require('../models/comment.model');
      const comment = await Comment.findById(commentId).select('postId userId').lean();

      if (!comment) {
        console.error('Comment not found:', commentId);
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      console.log('Like comment - creating new like');
      const like = new Like({
        postId: comment.postId,
        userId,
        commentId,
      });
      await like.save();
      console.log('Comment like created successfully:', like._id);

      // Create notification for comment owner
      if (comment.userId) {
        notificationService.createCommentLikeNotification(userId, comment.userId, commentId).catch(err => {
          console.error('Error creating comment like notification:', err);
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Comment liked successfully',
        data: { liked: true },
      });
    }
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      console.log('Duplicate like attempt detected, treating as already liked');
      return res.status(200).json({
        success: true,
        message: 'Comment already liked',
        data: { liked: true },
      });
    }
    console.error('Error toggling comment like:', error);
    next(error);
  }
};

module.exports = {
  toggleLike,
  getLikeStatus,
  getLikesForPost,
  toggleCommentLike,
};
