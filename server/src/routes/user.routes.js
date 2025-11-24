const express = require('express');
const {
  getPublicUsers,
  getUserProfile,
  getMyProfile
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes (auth required) - MUST come before dynamic :userId route
// GET /api/users/me - Get current user's own profile
router.get('/me', protect, getMyProfile);

// Public routes (no auth required)
// GET /api/users - Get all public users with optional search
router.get('/', getPublicUsers);

// GET /api/users/:userId - Get a specific user's public profile (MUST be last)
router.get('/:userId', getUserProfile);

module.exports = router;
