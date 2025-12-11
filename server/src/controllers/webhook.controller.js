const { stripe } = require('../config/stripe.config');
const stripeService = require('../services/stripe.service');
const logger = require('../utils/logger');

/**
 * Handle Stripe webhook events
 */
exports.handleStripeWebhook = async (req, res) => {
  // Check if Stripe is configured
  if (!stripe) {
    logger.error('Stripe is not configured');
    return res.status(503).json({
      success: false,
      message: 'Stripe service is not configured'
    });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('Stripe webhook secret is not configured');
    return res.status(503).json({
      success: false,
      message: 'Webhook secret is not configured'
    });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Payment successful and subscription created
        const session = event.data.object;
        logger.success('Checkout session completed');

        // If this is a subscription checkout, get the subscription and update user
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await stripeService.handleSubscriptionUpdate(subscription);
          logger.success('User subscription updated from checkout session');
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Subscription created or updated
        await stripeService.handleSubscriptionUpdate(event.data.object);
        logger.success('Subscription updated');
        break;

      case 'customer.subscription.deleted':
        // Subscription canceled
        await stripeService.handleSubscriptionDeleted(event.data.object);
        logger.success('Subscription deleted');
        break;

      case 'customer.subscription.trial_will_end':
        // Trial will end in 3 days (you can send notification email here)
        logger.info('Trial ending soon');
        // TODO: Implement email notification
        break;

      case 'invoice.payment_succeeded':
        // Payment succeeded
        logger.success('Invoice payment succeeded');
        break;

      case 'invoice.payment_failed':
        // Payment failed
        logger.warn('Invoice payment failed');
        // TODO: Implement email notification
        break;

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook:', error.message);
    res.status(500).json({
      success: false,
      message: 'Webhook handler failed'
    });
  }
};
