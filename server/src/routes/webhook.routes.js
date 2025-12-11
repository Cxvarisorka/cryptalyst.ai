const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Health check endpoint for webhooks
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

// Stripe webhook endpoint
// NOTE: This must be registered BEFORE express.json() middleware
// to preserve raw body for signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
