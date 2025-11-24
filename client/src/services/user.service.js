import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cryptalyst.onrender.com/api';

// Configure axios to send httpOnly cookies
axios.defaults.withCredentials = true;

const userService = {
  // Get all public users with optional search
  getPublicUsers: async (searchQuery = '') => {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await axios.get(`${API_BASE_URL}/users`, { params });
    return response.data;
  },

  // Get a specific user's public profile
  getUserProfile: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  },

  // Get current user's own profile (requires auth)
  getMyProfile: async () => {
    const response = await axios.get(`${API_BASE_URL}/users/me`);
    return response.data;
  }
};

export default userService;
