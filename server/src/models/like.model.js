const mongoose = require('mongoose');

/**
 * Like Schema
 * Represents a like on a post or comment
 */
const likeSchema = new mongoose.Schema(
  {
    // Reference to the post being liked
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required'],
      index: true,
    },

    // User who liked the post
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Optional: Support for liking comments
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate likes
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });
likeSchema.index({ commentId: 1, userId: 1 }, { unique: true });


/**
 * Middleware to update post's likesCount on save
 */
likeSchema.post('save', async function () {
  if (this.postId) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(this.postId, {
      $inc: { likesCount: 1 },
    });
  }

  if (this.commentId) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(this.commentId, {
      $inc: { likesCount: 1 },
    });
  }
});

/**
 * Helper function to decrement like counts
 */
async function decrementLikeCounts(doc) {
  if (!doc) return;

  if (doc.postId) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(doc.postId, {
      $inc: { likesCount: -1 },
    });
  }

  if (doc.commentId) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(doc.commentId, {
      $inc: { likesCount: -1 },
    });
  }
}

/**
 * Middleware to update counts on deletion
 */
likeSchema.post('findOneAndDelete', decrementLikeCounts);
likeSchema.post('findByIdAndDelete', decrementLikeCounts);

/**
 * Static method to check if user has liked a post
 */
likeSchema.statics.hasUserLikedPost = async function (userId, postId) {
  const like = await this.findOne({ userId, postId });
  return !!like;
};

/**
 * Static method to get users who liked a post
 */
likeSchema.statics.getLikesForPost = async function (postId, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const [likes, total] = await Promise.all([
    this.find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar email')
      .lean(),
    this.countDocuments({ postId }),
  ]);

  return {
    likes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
