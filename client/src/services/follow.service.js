import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const followService = {
  // Follow a user
  followUser: async (userId) => {
    const response = await axios.post(
      `${API_URL}/users/${userId}/follow`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    const response = await axios.delete(`${API_URL}/users/${userId}/follow`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get followers of a user
  getFollowers: async (userId, page = 1, limit = 20) => {
    const response = await axios.get(
      `${API_URL}/users/${userId}/followers`,
      {
        params: { page, limit },
        withCredentials: true,
      }
    );
    return response.data;
  },

  // Get users that a user is following
  getFollowing: async (userId, page = 1, limit = 20) => {
    const response = await axios.get(
      `${API_URL}/users/${userId}/following`,
      {
        params: { page, limit },
        withCredentials: true,
      }
    );
    return response.data;
  },

  // Check if current user is following a specific user
  checkFollowStatus: async (userId) => {
    const response = await axios.get(`${API_URL}/users/${userId}/follow-status`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get follow stats (follower count, following count)
  getFollowStats: async (userId) => {
    const response = await axios.get(`${API_URL}/users/${userId}/follow-stats`, {
      withCredentials: true,
    });
    return response.data;
  },
};

export default followService;
