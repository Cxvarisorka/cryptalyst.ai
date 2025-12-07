import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SubscriptionService {
  /**
   * Get available subscription plans
   */
  async getPlans() {
    try {
      const response = await axios.get(`${API_URL}/subscription/plans`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting plans:', error);
      throw error.response?.data || { message: 'Failed to get plans' };
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus() {
    try {
      const response = await axios.get(`${API_URL}/subscription/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error.response?.data || { message: 'Failed to get subscription status' };
    }
  }

  /**
   * Create checkout session and redirect to Stripe
   */
  async checkout(planType) {
    try {
      const response = await axios.post(
        `${API_URL}/subscription/checkout`,
        { planType },
        { withCredentials: true }
      );

      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error.response?.data || { message: 'Failed to create checkout session' };
    }
  }

  /**
   * Open Stripe customer portal
   */
  async openCustomerPortal() {
    try {
      const response = await axios.post(
        `${API_URL}/subscription/portal`,
        {},
        { withCredentials: true }
      );

      // Redirect to Stripe portal
      if (response.data.url) {
        window.location.href = response.data.url;
      }

      return response.data;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error.response?.data || { message: 'Failed to open customer portal' };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription() {
    try {
      const response = await axios.post(
        `${API_URL}/subscription/cancel`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error.response?.data || { message: 'Failed to cancel subscription' };
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription() {
    try {
      const response = await axios.post(
        `${API_URL}/subscription/reactivate`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error.response?.data || { message: 'Failed to reactivate subscription' };
    }
  }
}

export default new SubscriptionService();
