const mongoose = require('mongoose');

/**
 * Comment Schema
 * Represents a comment on a post with support for nested replies
 */
const commentSchema = new mongoose.Schema(
  {
    // Post this comment belongs to
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required'],
      index: true,
    },

    // User who created the comment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Comment content
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },

    // Support for nested replies (parent comment ID)
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    // Engagement metrics
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Moderation
    isReported: {
      type: Boolean,
      default: false,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
commentSchema.index({ postId: 1, createdAt: -1 }); // Get comments for a post
commentSchema.index({ userId: 1, createdAt: -1 }); // Get user's comments
commentSchema.index({ parentCommentId: 1, createdAt: 1 }); // Get replies to a comment

/**
 * Virtual for populated user data
 */
commentSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual for populated replies
 */
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
});

// Ensure virtuals are included in JSON output
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

/**
 * Middleware to update post's commentsCount
 */
commentSchema.post('save', async function () {
  const Post = mongoose.model('Post');

  // Only increment if this is a top-level comment (not a reply)
  if (!this.parentCommentId) {
    await Post.findByIdAndUpdate(this.postId, {
      $inc: { commentsCount: 1 },
    });
  }
});

/**
 * Middleware to update post's commentsCount on deletion
 */
commentSchema.post('findOneAndDelete', async function (doc) {
  if (doc && !doc.parentCommentId) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(doc.postId, {
      $inc: { commentsCount: -1 },
    });
  }
});

/**
 * Static method to get comments for a post with pagination
 */
commentSchema.statics.getCommentsForPost = async function (
  postId,
  options = {}
) {
  const { page = 1, limit = 20, includeReplies = true, userId = null } = options;

  const skip = (page - 1) * limit;

  // Get top-level comments only
  const query = {
    postId,
    parentCommentId: null,
    isHidden: false,
  };

  const [comments, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar email')
      .lean(),
    this.countDocuments(query),
  ]);

  // Optionally load replies for each comment
  if (includeReplies) {
    const commentIds = comments.map((c) => c._id);
    const replies = await this.find({
      parentCommentId: { $in: commentIds },
      isHidden: false,
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatar email')
      .lean();

    // Attach replies to their parent comments
    const repliesMap = {};
    replies.forEach((reply) => {
      const parentId = reply.parentCommentId.toString();
      if (!repliesMap[parentId]) {
        repliesMap[parentId] = [];
      }
      repliesMap[parentId].push(reply);
    });

    comments.forEach((comment) => {
      comment.replies = repliesMap[comment._id.toString()] || [];
    });
  }

  // Add like status for authenticated user
  if (userId) {
    const Like = require('./like.model');

    // Collect all comment IDs (including replies)
    const allCommentIds = [];
    comments.forEach((comment) => {
      allCommentIds.push(comment._id);
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply) => {
          allCommentIds.push(reply._id);
        });
      }
    });

    // Find all likes by this user for these comments
    const likes = await Like.find({
      commentId: { $in: allCommentIds },
      userId: userId,
    }).select('commentId').lean();

    // Create a set of liked comment IDs for fast lookup
    const likedCommentIds = new Set(likes.map(like => like.commentId.toString()));

    // Add isLikedByUser field to each comment and reply
    comments.forEach((comment) => {
      comment.isLikedByUser = likedCommentIds.has(comment._id.toString());

      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply) => {
          reply.isLikedByUser = likedCommentIds.has(reply._id.toString());
        });
      }
    });
  }

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
