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
    console.log('\n🎯 ========================================');
    console.log(`📬 STRIPE WEBHOOK RECEIVED: ${event.type}`);
    console.log('Event ID:', event.id);
    console.log('========================================');

    switch (event.type) {
      case 'checkout.session.completed':
        // Payment successful and subscription created
        const session = event.data.object;
        console.log('💳 Checkout Session Completed');
        console.log('Session ID:', session.id);
        console.log('Mode:', session.mode);
        console.log('Subscription ID:', session.subscription);
        console.log('Metadata:', JSON.stringify(session.metadata, null, 2));

        // If this is a subscription checkout, get the subscription and update user
        if (session.mode === 'subscription' && session.subscription) {
          console.log('📥 Retrieving subscription details...');
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          console.log('✅ Subscription retrieved');
          console.log('Status:', subscription.status);
          console.log('Metadata:', JSON.stringify(subscription.metadata, null, 2));
          await stripeService.handleSubscriptionUpdate(subscription);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Subscription created or updated
        const subscriptionData = event.data.object;
        console.log(`📝 Subscription ${event.type === 'customer.subscription.created' ? 'Created' : 'Updated'}`);
        console.log('Subscription ID:', subscriptionData.id);
        console.log('Status:', subscriptionData.status);
        console.log('Metadata:', JSON.stringify(subscriptionData.metadata, null, 2));
        await stripeService.handleSubscriptionUpdate(subscriptionData);
        break;

      case 'customer.subscription.deleted':
        // Subscription canceled
        console.log('🗑️ Subscription Deleted');
        await stripeService.handleSubscriptionDeleted(event.data.object);
        console.log('✅ Subscription deletion handled');
        break;

      case 'customer.subscription.trial_will_end':
        // Trial will end in 3 days (you can send notification email here)
        console.log('⏰ Trial ending soon');
        // TODO: Implement email notification
        break;

      case 'invoice.payment_succeeded':
        // Payment succeeded
        console.log('✅ Invoice payment succeeded');
        break;

      case 'invoice.payment_failed':
        // Payment failed
        console.log('❌ Invoice payment failed');
        // TODO: Implement email notification
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log('========================================\n');

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('❌ ERROR handling webhook:', error.message);
    console.error('Stack:', error.stack);
    logger.error('Error handling webhook:', error.message);
    res.status(500).json({
      success: false,
      message: 'Webhook handler failed'
    });
  }
};
