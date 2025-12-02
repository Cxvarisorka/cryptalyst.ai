const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Get all notifications
router.get('/notifications', notificationController.getNotifications);

// Get unread notification count
router.get('/notifications/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.put('/notifications/mark-all-read', notificationController.markAllAsRead);

// Mark a specific notification as read
router.put('/notifications/:notificationId/read', notificationController.markAsRead);

// Delete a notification
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

module.exports = router;
