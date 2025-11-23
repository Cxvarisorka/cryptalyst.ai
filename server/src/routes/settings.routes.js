const express = require('express');
const {
  getSettings,
  updateProfile,
  updatePassword,
  updatePreferences,
  updateNotifications,
  updatePrivacy,
  deleteAccount
} = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/settings - Get user settings
router.get('/', getSettings);

// PUT /api/settings/profile - Update profile (name, email, avatar)
router.put('/profile', updateProfile);

// PUT /api/settings/password - Update password
router.put('/password', updatePassword);

// PUT /api/settings/preferences - Update preferences (currency, timezone, dateFormat, theme)
router.put('/preferences', updatePreferences);

// PUT /api/settings/notifications - Update notification settings
router.put('/notifications', updateNotifications);

// PUT /api/settings/privacy - Update privacy settings
router.put('/privacy', updatePrivacy);

// DELETE /api/settings/account - Delete account (soft delete)
router.delete('/account', deleteAccount);

module.exports = router;
