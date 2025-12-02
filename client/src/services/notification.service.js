import api from './api';

class NotificationService {
  /**
   * Get all notifications
   * @param {Object} params - Query parameters (page, limit, unreadOnly)
   */
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  /**
   * Mark a notification as read
   * @param {String} notificationId - Notification ID
   */
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  }

  /**
   * Delete a notification
   * @param {String} notificationId - Notification ID
   */
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
}

export default new NotificationService();
