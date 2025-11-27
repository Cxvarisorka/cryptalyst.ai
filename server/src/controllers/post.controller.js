const { body, param, query, validationResult } = require('express-validator');
const postService = require('../services/post.service');

/**
 * Post Controller
 * Handles HTTP requests for post operations
 */

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
 * POST /api/posts
 */
const createPost = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const postData = {
      userId: req.user._id,
      asset: {
        symbol: req.body.asset.symbol.toUpperCase(),
        name: req.body.asset.name,
        type: req.body.asset.type,
        image: req.body.asset.image || null,
      },
      content: req.body.content,
      tags: req.body.tags || [],
      visibility: req.body.visibility || 'public',
      sentiment: req.body.sentiment || 'neutral',
    };

    const post = await postService.createPost(postData, req.files);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feed posts with filters
 * GET /api/posts/feed
 */
const getFeed = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      assetSymbol: req.query.symbol,
      assetType: req.query.assetType,
      userId: req.query.userId,
      tag: req.query.tag,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await postService.getFeedPosts(options);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single post by ID
 * GET /api/posts/:id
 */
const getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Update a post
 * PATCH /api/posts/:id
 */
const updatePost = async (req, res, next) => {
  try {
    const updateData = {
      content: req.body.content,
      tags: req.body.tags,
      visibility: req.body.visibility,
    };

    const post = await postService.updatePost(
      req.params.id,
      req.user._id,
      updateData
    );

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

/**
 * Delete a post
 * DELETE /api/posts/:id
 */
const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
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

/**
 * Increment share count
 * POST /api/posts/:id/share
 */
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
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get posts by asset
 * GET /api/posts/asset/:symbol
 */
const getPostsByAsset = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await postService.getPostsByAsset(
      req.params.symbol,
      options
    );

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get posts by user
 * GET /api/posts/user/:userId
 */
const getPostsByUser = async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await postService.getPostsByUser(req.params.userId, options);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search posts
 * GET /api/posts/search
 */
const searchPosts = async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await postService.searchPosts(query, options);

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
  getPostsByAsset,
  getPostsByUser,
  searchPosts,
};
