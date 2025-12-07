const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrModerator } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// All admin routes require authentication
router.use(protect);

// Statistics (admin/moderator)
router.get('/statistics', adminOrModerator, adminController.getStatistics);

// User management (admin only)
router.get('/users', adminOnly, adminController.getAllUsers);
router.get('/users/:id', adminOnly, adminController.getUserById);
router.patch('/users/:id/role', adminOnly, adminController.updateUserRole);
router.patch('/users/:id/toggle-status', adminOnly, adminController.toggleUserStatus);
router.delete('/users/:id', adminOnly, adminController.deleteUser);

// Content moderation (admin/moderator)
router.get('/posts', adminOrModerator, adminController.getAllPosts);
router.delete('/posts/:id', adminOrModerator, adminController.deletePostById);
router.get('/comments', adminOrModerator, adminController.getAllComments);
router.delete('/comments/:id', adminOrModerator, adminController.deleteCommentById);

module.exports = router;
