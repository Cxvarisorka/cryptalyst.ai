import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cryptalyst.onrender.com/api';

// Configure axios to send httpOnly cookies
axios.defaults.withCredentials = true;

/**
 * Post Service
 * Frontend service for post-related API calls
 */
const postService = {
  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {Array<File>} images - Array of image files (max 4)
   * @returns {Promise} API response
   */
  createPost: async (postData, images = []) => {
    console.log('🌐 POST SERVICE: Creating post');
    console.log('📊 Post data:', postData);
    console.log('🖼️ Images:', images.length, images);

    const formData = new FormData();

    // Append text fields as JSON strings
    formData.append('asset', JSON.stringify(postData.asset));
    formData.append('content', postData.content);
    formData.append('tags', JSON.stringify(postData.tags || []));
    formData.append('visibility', postData.visibility || 'public');
    formData.append('sentiment', postData.sentiment || 'neutral');

    console.log('📝 FormData text fields appended');

    // Append images if provided (max 4)
    if (images && images.length > 0) {
      console.log(`📎 Appending ${images.length} images to FormData`);
      images.slice(0, 4).forEach((image, index) => {
        console.log(`  - Image ${index + 1}:`, image.name, image.type, `${(image.size / 1024).toFixed(2)} KB`);
        formData.append('images', image);
      });
    } else {
      console.log('⚠️ No images to append');
    }

    // Log FormData contents
    console.log('📦 FormData contents:');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  - ${pair[0]}:`, pair[1].name, pair[1].type);
      } else {
        console.log(`  - ${pair[0]}:`, pair[1]);
      }
    }

    console.log('🚀 Sending POST request to:', `${API_BASE_URL}/posts`);

    const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ POST SERVICE: Response received:', response.data);

    return response.data;
  },



  /**
   * Get feed posts with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getFeed: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/posts/feed`, { params });
    return response.data;
  },

  /**
   * Get following feed (posts from users you follow)
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getFollowingFeed: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/posts/feed/following`, { params });
    return response.data;
  },

  /**
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise} API response
   */
  getPostById: async (postId) => {
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  },

  /**
   * Update a post
   * @param {string} postId - Post ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} API response
   */
  updatePost: async (postId, updateData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/posts/${postId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {Promise} API response
   */
  deletePost: async (postId) => {
    const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  },

  /**
   * Increment share count
   * @param {string} postId - Post ID
   * @returns {Promise} API response
   */
  sharePost: async (postId) => {
    const response = await axios.post(`${API_BASE_URL}/posts/${postId}/share`);
    return response.data;
  },

  /**
   * Get posts by asset symbol
   * @param {string} symbol - Asset symbol
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getPostsByAsset: async (symbol, params = {}) => {
    const response = await axios.get(
      `${API_BASE_URL}/posts/asset/${symbol}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get posts by user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getPostsByUser: async (userId, params = {}) => {
    const response = await axios.get(
      `${API_BASE_URL}/posts/user/${userId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Search posts
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  searchPosts: async (query, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/posts/search`, {
      params: { q: query, ...params },
    });
    return response.data;
  },

  /**
   * Toggle like on a post
   * @param {string} postId - Post ID
   * @returns {Promise} API response
   */
  toggleLike: async (postId) => {
    const response = await axios.post(`${API_BASE_URL}/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Get like status for a post
   * @param {string} postId - Post ID
   * @returns {Promise} API response
   */
  getLikeStatus: async (postId) => {
    const response = await axios.get(
      `${API_BASE_URL}/posts/${postId}/like/status`
    );
    return response.data;
  },

  /**
   * Get users who liked a post
   * @param {string} postId - Post ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getLikesForPost: async (postId, params = {}) => {
    const response = await axios.get(
      `${API_BASE_URL}/posts/${postId}/likes`,
      { params }
    );
    return response.data;
  },

  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getComments: async (postId, params = {}) => {
    const response = await axios.get(
      `${API_BASE_URL}/posts/${postId}/comments`,
      { params }
    );
    return response.data;
  },

  /**
   * Create a comment
   * @param {string} postId - Post ID
   * @param {Object} commentData - Comment data
   * @returns {Promise} API response
   */
  createComment: async (postId, commentData) => {
    const response = await axios.post(
      `${API_BASE_URL}/posts/${postId}/comments`,
      commentData
    );
    return response.data;
  },

  /**
   * Update a comment
   * @param {string} commentId - Comment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} API response
   */
  updateComment: async (commentId, updateData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/comments/${commentId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise} API response
   */
  deleteComment: async (commentId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/comments/${commentId}`
    );
    return response.data;
  },

  /**
   * Get replies for a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise} API response
   */
  getReplies: async (commentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/comments/${commentId}/replies`
    );
    return response.data;
  },

  /**
   * Toggle like on a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise} API response
   */
  toggleCommentLike: async (commentId) => {
    const response = await axios.post(
      `${API_BASE_URL}/comments/${commentId}/like`
    );
    return response.data;
  },
};

export default postService;
