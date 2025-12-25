const express = require('express');
const router = express.Router();
const aiUsageController = require('../controllers/aiUsage.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// All usage routes require authentication
router.use(protect);

// GET /api/usage/stats - Get AI usage statistics
router.get('/stats', aiUsageController.getUsageStats);

// GET /api/usage/check/:type - Check if user can perform analysis
router.get('/check/:type', aiUsageController.checkUsage);

// GET /api/usage/limits - Get plan limits information
router.get('/limits', aiUsageController.getPlanLimits);

module.exports = router;
