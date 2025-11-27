const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Follow a user
router.post('/users/:userId/follow', followController.followUser);

// Unfollow a user
router.delete('/users/:userId/follow', followController.unfollowUser);

// Get followers of a user
router.get('/users/:userId/followers', followController.getFollowers);

// Get users that a user is following
router.get('/users/:userId/following', followController.getFollowing);

// Check if current user is following a specific user
router.get('/users/:userId/follow-status', followController.checkFollowStatus);

// Get follow stats (follower count, following count)
router.get('/users/:userId/follow-stats', followController.getFollowStats);

module.exports = router;
