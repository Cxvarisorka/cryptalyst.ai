import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cryptalyst.onrender.com/api';

// Configure axios to send httpOnly cookies
axios.defaults.withCredentials = true;

const settingsService = {
  // Get all user settings
  getSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data;
  },

  // Update profile (name, email, avatar)
  updateProfile: async (profileData) => {
    const response = await axios.put(`${API_BASE_URL}/settings/profile`, profileData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await axios.put(`${API_BASE_URL}/settings/password`, passwordData);
    return response.data;
  },

  // Update preferences (currency, timezone, dateFormat, theme)
  updatePreferences: async (preferencesData) => {
    const response = await axios.put(`${API_BASE_URL}/settings/preferences`, preferencesData);
    return response.data;
  },

  // Update notification settings
  updateNotifications: async (notificationsData) => {
    const response = await axios.put(`${API_BASE_URL}/settings/notifications`, {
      notifications: notificationsData
    });
    return response.data;
  },

  // Update privacy settings
  updatePrivacy: async (privacyData) => {
    const response = await axios.put(`${API_BASE_URL}/settings/privacy`, {
      privacy: privacyData
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (deleteData) => {
    const response = await axios.delete(`${API_BASE_URL}/settings/account`, {
      data: deleteData
    });
    return response.data;
  }
};

export default settingsService;
