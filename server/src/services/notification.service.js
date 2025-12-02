const Notification = require('../models/notification.model');

class NotificationService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.io instance
   * @param {Object} io - Socket.io instance
   */
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Create a new notification and emit it in real-time
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification({ recipient, sender, type, message, relatedEntity }) {
    try {
      // Create notification in database
      const notification = new Notification({
        recipient,
        sender: sender || null, // Optional sender for system notifications
        type,
        message,
        relatedEntity,
      });

      await notification.save();

      // Populate sender information for real-time emission (if sender exists)
      if (notification.sender) {
        await notification.populate('sender', 'name email avatar');
      }

      // Emit notification to recipient via Socket.io
      if (this.io) {
        this.io.to(recipient.toString()).emit('notification', {
          _id: notification._id,
          type: notification.type,
          message: notification.message,
          sender: notification.sender,
          relatedEntity: notification.relatedEntity,
          read: notification.read,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create a follow notification
   * @param {String} followerId - ID of user who followed
   * @param {String} followedUserId - ID of user who was followed
   */
  async createFollowNotification(followerId, followedUserId) {
    const message = 'started following you';

    return this.createNotification({
      recipient: followedUserId,
      sender: followerId,
      type: 'follow',
      message,
    });
  }

  /**
   * Get all notifications for a user
   * @param {String} userId - User ID
   * @param {Object} options - Query options (page, limit, unreadOnly)
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const query = { recipient: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID (to verify ownership)
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   * @param {String} userId - User ID
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    return { success: true };
  }

  /**
   * Get unread notification count
   * @param {String} userId - User ID
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return count;
  }

  /**
   * Delete a notification
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID (to verify ownership)
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    return notification;
  }
}

module.exports = new NotificationService();
