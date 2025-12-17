import axios from 'axios';

const onboardingService = {
  /**
   * Get current onboarding status
   */
  getStatus: async () => {
    const response = await axios.get('/onboarding');
    return response.data;
  },

  /**
   * Complete a specific task
   * @param {string} taskId - The task ID to complete
   */
  completeTask: async (taskId) => {
    const response = await axios.post(`/onboarding/task/${taskId}`);
    return response.data;
  },

  /**
   * Dismiss the onboarding widget
   */
  dismiss: async () => {
    const response = await axios.post('/onboarding/dismiss');
    return response.data;
  },

  /**
   * Reset onboarding (for testing)
   */
  reset: async () => {
    const response = await axios.post('/onboarding/reset');
    return response.data;
  }
};

export default onboardingService;
