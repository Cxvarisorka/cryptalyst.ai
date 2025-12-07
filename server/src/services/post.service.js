const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const PostFilter = require('../utils/PostFilter');
const { deleteMultipleFromCloudinary } = require('../config/cloudinary');
const Follow = require('../models/follow.model');

/**
 * Add like status to posts for a specific user
 * @param {Array} posts - Array of posts
 * @param {string} userId - User ID to check likes for
 * @returns {Promise<Array>} Posts with isLikedByUser field
 */
const enrichPostsWithLikeStatus = async (posts, userId) => {
  if (!userId || !posts || posts.length === 0) {
    return posts.map(post => ({ ...post, isLikedByUser: false }));
  }

  // Get all post IDs
  const postIds = posts.map(post => post._id || post.id);

  // Find all likes by this user for these posts
  const likes = await Like.find({
    postId: { $in: postIds },
    userId: userId,
  }).select('postId').lean();

  // Create a set of liked post IDs for fast lookup
  const likedPostIds = new Set(likes.map(like => like.postId.toString()));

  // Add isLikedByUser field to each post
  return posts.map(post => {
    const postId = (post._id || post.id).toString();
    return {
      ...post,
      isLikedByUser: likedPostIds.has(postId),
    };
  });
};

/**
 * Post Service
 * Business logic for post operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data including userId, asset, content, tags, images
 * @returns {Promise<Object>} Created post
 */
const createPost = async (postData) => {
  try {
    // Create post with images
    const post = new Post({
      ...postData,
      images: postData.images || [],
    });

    await post.save();

    // Populate user data
    await post.populate('userId', 'name avatar email');

    return post;
  } catch (error) {
    console.error('Error in createPost service:', error);
    throw error;
  }
};

/**
 * Get feed posts with filters and pagination
 * @param {Object} query - Query parameters from request
 * @param {string} userId - Optional user ID to check like status
 * @returns {Promise<Object>} Posts with pagination
 */
const getFeedPosts = async (query = {}, userId = null) => {
  try {
    // Create filter instance with query parameters
    const postFilter = new PostFilter(query);

    // Exclude hidden posts
    postFilter.excludeHidden();

    // Build and execute query using the FilterBuilder's execute method
    const result = await postFilter.execute(Post);

    // Enrich posts with like status if user is authenticated
    let posts = result.data;
    if (userId) {
      posts = await enrichPostsWithLikeStatus(posts, userId);
    }

    return {
      posts: posts,
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

  // Delete images from Cloudinary if they exist
  if (post.images && post.images.length > 0) {
    const publicIds = post.images
      .filter(img => img.publicId) // Only delete images with publicId
      .map(img => img.publicId);

    if (publicIds.length > 0) {
      try {
        console.log(`Deleting ${publicIds.length} images from Cloudinary:`, publicIds);
        await deleteMultipleFromCloudinary(publicIds);
        console.log('Images deleted successfully from Cloudinary');
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
        // Continue with post deletion even if image deletion fails
      }
    }
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
 * Create a repost (share post to user's timeline)
 * @param {string} userId - User ID creating the repost
 * @param {string} originalPostId - Original post ID to share
 * @param {string} shareComment - Optional comment when sharing
 * @returns {Promise<Object>} Created repost
 */
const createRepost = async (userId, originalPostId, shareComment = '') => {
  // Get the original post
  const originalPost = await Post.findById(originalPostId)
    .populate('userId', 'name avatar email');

  if (!originalPost) {
    throw new Error('Post not found');
  }

  // Check if the original post is private
  if (originalPost.visibility === 'private') {
    throw new Error('Cannot share private posts');
  }

  // Check if user already shared this post
  const existingRepost = await Post.findOne({
    userId: userId,
    sharedPost: originalPostId,
  });

  if (existingRepost) {
    throw new Error('Post already shared');
  }

  // Create the repost
  const repost = new Post({
    userId: userId,
    asset: originalPost.asset,
    content: originalPost.content,
    sharedPost: originalPostId,
    shareComment: shareComment || '',
    visibility: 'public', // Reposts are always public
    tags: originalPost.tags,
    sentiment: originalPost.sentiment,
  });

  await repost.save();
  await repost.populate('userId', 'name avatar email');
  await repost.populate({
    path: 'sharedPost',
    populate: { path: 'userId', select: 'name avatar email' },
  });

  // Increment share count on original post
  await originalPost.incrementShares();

  return repost;
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

/**
 * Get posts from users that the current user is following
 * @param {string} userId - Current user ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Posts with pagination
 */
const getFollowingFeed = async (userId, query = {}) => {
  try {
    // Get list of users that the current user is following
    const follows = await Follow.find({ follower: userId })
      .select('following')
      .lean();

    const followingIds = follows.map((f) => f.following);

    if (followingIds.length === 0) {
      // User is not following anyone, return empty result
      return {
        posts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasMore: false,
        },
      };
    }

    // Create filter instance with query parameters
    const postFilter = new PostFilter(query);

    // Add filter to only show posts from followed users
    postFilter.addFilter('userId', followingIds, 'in');

    // Exclude hidden posts
    postFilter.excludeHidden();

    // Build and execute query
    const result = await postFilter.execute(Post);

    // Enrich posts with like status if user is authenticated
    let posts = result.data;
    if (userId) {
      posts = await enrichPostsWithLikeStatus(posts, userId);
    }

    return {
      posts: posts,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('Error in getFollowingFeed:', error);
    throw error;
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  incrementShareCount,
  createRepost,
  getPostsByAsset,
  getPostsByUser,
  getPostsByTag,
  searchPosts,
  getFollowingFeed,
};
