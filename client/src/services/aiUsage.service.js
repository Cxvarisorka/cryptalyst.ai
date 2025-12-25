import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class AIUsageService {
  /**
   * Get AI usage statistics for the current user
   */
  async getUsageStats() {
    try {
      const response = await axios.get(`${API_URL}/usage/stats`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error.response?.data || { message: 'Failed to get usage stats' };
    }
  }

  /**
   * Check if user can perform a specific analysis type
   * @param {string} type - Analysis type: 'crypto', 'stock', 'portfolio', 'scalping'
   */
  async checkUsage(type) {
    try {
      const response = await axios.get(`${API_URL}/usage/check/${type}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error checking usage:', error);
      throw error.response?.data || { message: 'Failed to check usage' };
    }
  }

  /**
   * Get plan limits information
   */
  async getPlanLimits() {
    try {
      const response = await axios.get(`${API_URL}/usage/limits`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting plan limits:', error);
      throw error.response?.data || { message: 'Failed to get plan limits' };
    }
  }
}

export default new AIUsageService();
