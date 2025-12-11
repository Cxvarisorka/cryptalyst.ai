const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Health check endpoint for webhooks
router.get('/health', (req, res) => {
  const config = {
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  console.log('🏥 Webhook Health Check:', config);

  res.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    config
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
