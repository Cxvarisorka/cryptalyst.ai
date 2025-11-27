const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const PostFilter = require('../utils/PostFilter');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} = require('../config/cloudinary');

/**
 * Post Service
 * Business logic for post operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data including userId, asset, content, tags
 * @param {Array} files - Uploaded image files (multer files)
 * @returns {Promise<Object>} Created post
 */
const createPost = async (postData, files = []) => {
  try {
    // Upload images to Cloudinary
    const uploadedImages = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        });
      }
    }

    // Create post with uploaded images
    const post = new Post({
      ...postData,
      images: uploadedImages,
    });

    await post.save();

    // Populate user data
    await post.populate('userId', 'name avatar email');

    return post;
  } catch (error) {
    // Cleanup uploaded images if post creation fails
    if (uploadedImages.length > 0) {
      const publicIds = uploadedImages.map((img) => img.publicId);
      await deleteMultipleFromCloudinary(publicIds).catch(console.error);
    }
    throw error;
  }
};

/**
 * Get feed posts with filters and pagination
 * @param {Object} query - Query parameters from request
 * @returns {Promise<Object>} Posts with pagination
 */
const getFeedPosts = async (query = {}) => {
  try {
    // Create filter instance with query parameters
    const postFilter = new PostFilter(query);

    // Exclude hidden posts
    postFilter.excludeHidden();

    // Build and execute query using the FilterBuilder's execute method
    const result = await postFilter.execute(Post);

    return {
      posts: result.data,
      pagination: result.pagination
    };
  } catch (error) {
    console.error('Error in getFeedPosts:', error);
    throw error;
  }
};

/**
 * Get a single post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Post data
 */
const getPostById = async (postId) => {
  const post = await Post.findById(postId)
    .populate('userId', 'name avatar email')
    .lean();

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
};

/**
 * Update a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated post
 */
const updatePost = async (postId, userId, updateData) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check authorization
  if (post.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to update this post');
  }

  // Update allowed fields
  const allowedUpdates = ['content', 'tags', 'visibility'];
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      post[key] = updateData[key];
    }
  });

  await post.save();
  await post.populate('userId', 'name avatar email');

  return post;
};

/**
 * Delete a post and associated data
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check authorization
  if (post.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to delete this post');
  }

  // Delete images from Cloudinary
  if (post.images && post.images.length > 0) {
    const publicIds = post.images.map((img) => img.publicId);
    await deleteMultipleFromCloudinary(publicIds).catch(console.error);
  }

  // Delete associated comments and likes
  await Promise.all([
    Comment.deleteMany({ postId }),
    Like.deleteMany({ postId }),
    post.deleteOne(),
  ]);
};

/**
 * Increment share count
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Updated post
 */
const incrementShareCount = async (postId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  await post.incrementShares();
  return post;
};

/**
 * Get posts by asset symbol
 * @param {string} symbol - Asset symbol
 * @param {Object} query - Query options
 * @returns {Promise<Object>} Posts with pagination
 */
const getPostsByAsset = async (symbol, query = {}) => {
  return await getFeedPosts({ ...query, assetSymbol: symbol });
};

/**
 * Get posts by user
 * @param {string} userId - User ID
 * @param {Object} query - Query options
 * @returns {Promise<Object>} Posts with pagination
 */
const getPostsByUser = async (userId, query = {}) => {
  return await getFeedPosts({ ...query, userId });
};

/**
 * Get posts by tag
 * @param {string} tag - Tag name
 * @param {Object} query - Query options
 * @returns {Promise<Object>} Posts with pagination
 */
const getPostsByTag = async (tag, query = {}) => {
  return await getFeedPosts({ ...query, tag });
};

/**
 * Search posts by content or tags
 * @param {string} searchQuery - Search query
 * @param {Object} query - Query options
 * @returns {Promise<Object>} Search results
 */
const searchPosts = async (searchQuery, query = {}) => {
  return await getFeedPosts({ ...query, search: searchQuery });
};

module.exports = {
  createPost,
  getFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  incrementShareCount,
  getPostsByAsset,
  getPostsByUser,
  getPostsByTag,
  searchPosts,
};
