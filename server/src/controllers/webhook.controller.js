const { stripe } = require('../config/stripe.config');
const stripeService = require('../services/stripe.service');

/**
 * Handle Stripe webhook events
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Payment successful and subscription created
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);

        // If this is a subscription checkout, get the subscription and update user
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await stripeService.handleSubscriptionUpdate(subscription);
          console.log('✅ User subscription updated from checkout session');
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Subscription created or updated
        await stripeService.handleSubscriptionUpdate(event.data.object);
        console.log('✅ Subscription updated:', event.data.object.id);
        break;

      case 'customer.subscription.deleted':
        // Subscription canceled
        await stripeService.handleSubscriptionDeleted(event.data.object);
        console.log('Subscription deleted:', event.data.object.id);
        break;

      case 'customer.subscription.trial_will_end':
        // Trial will end in 3 days (you can send notification email here)
        console.log('Trial will end:', event.data.object.id);
        // TODO: Implement email notification
        break;

      case 'invoice.payment_succeeded':
        // Payment succeeded
        console.log('Invoice payment succeeded:', event.data.object.id);
        break;

      case 'invoice.payment_failed':
        // Payment failed
        console.log('Invoice payment failed:', event.data.object.id);
        // TODO: Implement email notification
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook handler failed'
    });
  }
};
