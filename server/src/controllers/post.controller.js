const { body, validationResult } = require('express-validator');
const postService = require('../services/post.service');
const { uploadToCloudinary } = require('../config/cloudinary');
const Follow = require('../models/follow.model');
const notificationService = require('../services/notification.service');

/**
 * Validation rules for creating a post
 */
const createPostValidation = [
  body('asset.symbol')
    .trim()
    .notEmpty()
    .withMessage('Asset symbol is required')
    .isLength({ max: 10 })
    .withMessage('Symbol must be 10 characters or less'),
  body('asset.name')
    .trim()
    .notEmpty()
    .withMessage('Asset name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be 100 characters or less'),
  body('asset.type')
    .isIn(['crypto', 'stock'])
    .withMessage('Asset type must be crypto or stock'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be 30 characters or less'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Invalid visibility option'),
  body('sentiment')
    .optional()
    .isIn(['bullish', 'bearish', 'neutral'])
    .withMessage('Invalid sentiment option'),
];

/**
 * Create a new post
 */
const createPost = async (req, res, next) => {
  try {
    // Check validation errors (JSON parsing already done in middleware)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    console.log('✅ Validation passed');
    console.log('📊 Request body:', req.body);
    console.log('📁 Files received:', req.files?.length || 0);

    const asset = req.body.asset || {};

    // Upload images to Cloudinary if provided
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} images to Cloudinary...`);

      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'posts');
          uploadedImages.push({
            url: result.url,
            publicId: result.publicId,
          });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue with other images even if one fails
        }
      }

      console.log(`Successfully uploaded ${uploadedImages.length} images`);
    }

    const postData = {
      userId: req.user._id,
      asset: {
        symbol: (asset.symbol || '').toUpperCase(),
        name: asset.name || '',
        type: asset.type || '',
        image: asset.image || null,
      },
      content: req.body.content || '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      visibility: req.body.visibility || 'public',
      sentiment: req.body.sentiment || 'neutral',
      images: uploadedImages,
    };

    const post = await postService.createPost(postData);

    // Notify followers about the new post (async, don't wait)
    Follow.find({ following: req.user._id })
      .select('follower')
      .lean()
      .then((followers) => {
        if (followers && followers.length > 0) {
          const followerIds = followers.map((f) => f.follower);
          notificationService
            .createNewPostNotifications(req.user._id, post._id, followerIds)
            .catch((err) => console.error('Error creating post notifications:', err));
        }
      })
      .catch((err) => console.error('Error finding followers:', err));

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    next(error);
  }
};

// Other controllers (getFeed, getPostById, updatePost, deletePost, sharePost, etc.)
const getFeed = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id;
    const result = await postService.getFeedPosts(req.query, currentUserId);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    let post = await postService.getPostById(req.params.id);

    // Add like status if user is authenticated
    if (req.user?._id) {
      const Like = require('../models/like.model');
      const liked = await Like.findOne({
        postId: req.params.id,
        userId: req.user._id,
      }).lean();

      post = {
        ...post,
        isLikedByUser: !!liked,
      };
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const updateData = {
      content: req.body.content,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      visibility: req.body.visibility,
    };

    const post = await postService.updatePost(req.params.id, req.user._id, updateData);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    if (
      error.message === 'Post not found' ||
      error.message === 'Unauthorized to update this post'
    ) {
      return res.status(error.message === 'Post not found' ? 404 : 403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    if (
      error.message === 'Post not found' ||
      error.message === 'Unauthorized to delete this post'
    ) {
      return res.status(error.message === 'Post not found' ? 404 : 403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const sharePost = async (req, res, next) => {
  try {
    const post = await postService.incrementShareCount(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Share count incremented',
      data: { sharesCount: post.sharesCount },
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Create a repost (share to your timeline)
 */
const repostPost = async (req, res, next) => {
  try {
    const { shareComment } = req.body;
    const originalPostId = req.params.id;

    const repost = await postService.createRepost(
      req.user._id,
      originalPostId,
      shareComment
    );

    res.status(201).json({
      success: true,
      message: 'Post shared to your timeline',
      data: repost,
    });
  } catch (error) {
    if (
      error.message === 'Post not found' ||
      error.message === 'Cannot share private posts' ||
      error.message === 'Post already shared'
    ) {
      return res.status(error.message === 'Post not found' ? 404 : 400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const getPostsByAsset = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await postService.getPostsByAsset(req.params.symbol, options);

    res.status(200).json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getPostsByUser = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await postService.getPostsByUser(req.params.userId, options);

    res.status(200).json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const searchPosts = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await postService.searchPosts(query, options);

    res.status(200).json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getFollowingFeed = async (req, res, next) => {
  try {
    // Require authentication for following feed
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view following feed',
      });
    }

    const result = await postService.getFollowingFeed(req.user._id, req.query);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  createPostValidation,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  sharePost,
  repostPost,
  getPostsByAsset,
  getPostsByUser,
  searchPosts,
  getFollowingFeed,
};
