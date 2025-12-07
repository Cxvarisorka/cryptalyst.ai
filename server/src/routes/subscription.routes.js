const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Get current subscription status
router.get('/status', subscriptionController.getSubscriptionStatus);

// Create checkout session
router.post('/checkout', subscriptionController.createCheckoutSession);

// Create portal session
router.post('/portal', subscriptionController.createPortalSession);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Reactivate subscription
router.post('/reactivate', subscriptionController.reactivateSubscription);

module.exports = router;
