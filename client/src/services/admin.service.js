import api from './api';

/**
 * Admin service for managing users, content, and platform statistics
 */
const adminService = {
  /**
   * Get platform statistics
   */
  getStatistics: async () => {
    try {
      const response = await api.get('/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * Get all users with pagination and filters
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  /**
   * Toggle user active status (ban/unban)
   */
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get all posts with pagination and filters
   */
  getAllPosts: async (params = {}) => {
    try {
      const response = await api.get('/admin/posts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  /**
   * Delete post
   */
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  /**
   * Get all comments with pagination and filters
   */
  getAllComments: async (params = {}) => {
    try {
      const response = await api.get('/admin/comments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Delete comment
   */
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/admin/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

export default adminService;
