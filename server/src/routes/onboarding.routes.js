const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getOnboarding,
  completeTask,
  dismissOnboarding,
  resetOnboarding
} = require('../controllers/onboarding.controller');

// All routes require authentication
router.use(protect);

// GET /api/onboarding - Get onboarding status
router.get('/', getOnboarding);

// POST /api/onboarding/task/:taskId - Complete a task
router.post('/task/:taskId', completeTask);

// POST /api/onboarding/dismiss - Dismiss onboarding widget
router.post('/dismiss', dismissOnboarding);

// POST /api/onboarding/reset - Reset onboarding (for testing)
router.post('/reset', resetOnboarding);

module.exports = router;
