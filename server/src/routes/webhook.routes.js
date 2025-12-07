const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Stripe webhook endpoint
// NOTE: This must be registered BEFORE express.json() middleware
// to preserve raw body for signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
