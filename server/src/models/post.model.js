const mongoose = require('mongoose');

/**
 * Post Schema
 * Represents a user post about a specific asset (coin/stock) with support for
 * images, tags, likes, comments, and social sharing
 */
const postSchema = new mongoose.Schema(
  {
    // User who created the post
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Asset information
    asset: {
      symbol: {
        type: String,
        required: [true, 'Asset symbol is required'],
        uppercase: true,
        trim: true,
        index: true,
      },
      name: {
        type: String,
        required: [true, 'Asset name is required'],
        trim: true,
      },
      type: {
        type: String,
        enum: ['crypto', 'stock'],
        required: [true, 'Asset type is required'],
      },
      image: {
        type: String, // URL to asset logo
      },
    },

    // Post content
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },

    // Uploaded images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String, // For Cloudinary deletion
        },
      },
    ],

    // Post tags (e.g., #bullish, #analysis, #news)
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters'],
      },
    ],

    // Sentiment (optional)
    sentiment: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral'],
      default: 'neutral',
    },

    // Engagement metrics
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Privacy settings
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },

    // Shared post reference (for reposts/shares)
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
      index: true,
    },

    // Optional comment when sharing (reposting with thoughts)
    shareComment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Share comment cannot exceed 1000 characters'],
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
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound indexes for efficient queries
postSchema.index({ 'asset.symbol': 1, createdAt: -1 }); // Get posts for specific asset
postSchema.index({ userId: 1, createdAt: -1 }); // Get user's posts
postSchema.index({ createdAt: -1 }); // Get recent posts
postSchema.index({ tags: 1, createdAt: -1 }); // Get posts by tag

/**
 * Virtual for populated user data
 */
postSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual for populated likes
 */
postSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'postId',
});

/**
 * Virtual for populated comments
 */
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
});

// Ensure virtuals are included in JSON output
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

/**
 * Increment shares count
 */
postSchema.methods.incrementShares = async function () {
  this.sharesCount += 1;
  await this.save();
  return this;
};

/**
 * Static method to get feed posts with filters
 */
postSchema.statics.getFeed = async function (options = {}) {
  const {
    page = 1,
    limit = 20,
    assetSymbol,
    assetType,
    userId,
    tag,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const query = { isHidden: false };

  if (assetSymbol) {
    query['asset.symbol'] = assetSymbol.toUpperCase();
  }

  if (assetType) {
    query['asset.type'] = assetType;
  }

  if (userId) {
    query.userId = userId;
  }

  if (tag) {
    query.tags = tag.toLowerCase();
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [posts, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar email')
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
