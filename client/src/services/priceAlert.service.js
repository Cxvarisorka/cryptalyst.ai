import api from './api';

const priceAlertService = {
  // Create a new price alert
  createAlert: async (alertData) => {
    const response = await api.post('/price-alerts', alertData);
    return response.data;
  },

  // Get all alerts for the current user
  getUserAlerts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/price-alerts?${params}`);
    return response.data;
  },

  // Get a single alert by ID
  getAlertById: async (alertId) => {
    const response = await api.get(`/price-alerts/${alertId}`);
    return response.data;
  },

  // Update an alert
  updateAlert: async (alertId, updateData) => {
    const response = await api.put(`/price-alerts/${alertId}`, updateData);
    return response.data;
  },

  // Delete an alert
  deleteAlert: async (alertId) => {
    const response = await api.delete(`/price-alerts/${alertId}`);
    return response.data;
  },

  // Delete all triggered alerts
  deleteTriggeredAlerts: async () => {
    const response = await api.delete('/price-alerts/triggered/all');
    return response.data;
  },

  // Get alert statistics
  getAlertStats: async () => {
    const response = await api.get('/price-alerts/stats');
    return response.data;
  }
};

export default priceAlertService;
