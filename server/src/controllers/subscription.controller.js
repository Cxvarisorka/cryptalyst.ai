const stripeService = require('../services/stripe.service');
const { SUBSCRIPTION_PLANS } = require('../config/stripe.config');
const logger = require('../utils/logger');

/**
 * Get available subscription plans
 */
exports.getPlans = async (req, res) => {
  try {
    logger.debug('GET /plans endpoint reached');
    res.json({
      success: true,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    logger.error('Error getting plans:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get plans'
    });
  }
};

/**
 * Create checkout session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planType } = req.body;

    if (!planType || !['basic', 'premium'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const session = await stripeService.createCheckoutSession(
      req.user._id,
      planType
    );

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
};

/**
 * Create portal session for managing subscription
 */
exports.createPortalSession = async (req, res) => {
  try {
    const session = await stripeService.createPortalSession(req.user._id);

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    logger.error('Error creating portal session:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create portal session'
    });
  }
};

/**
 * Get current subscription status
 */
exports.getSubscriptionStatus = async (req, res) => {
  try {
    console.log('📊 Getting subscription status for user:', req.user._id);
    const status = await stripeService.getSubscriptionStatus(req.user._id);
    console.log('✅ Subscription status retrieved:', JSON.stringify(status, null, 2));

    res.json({
      success: true,
      subscription: status
    });
  } catch (error) {
    console.error('❌ Error getting subscription status:', error.message);
    logger.error('Error getting subscription status:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription status'
    });
  }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
  try {
    await stripeService.cancelSubscription(req.user._id);

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period'
    });
  } catch (error) {
    logger.error('Error canceling subscription:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription'
    });
  }
};

/**
 * Reactivate subscription
 */
exports.reactivateSubscription = async (req, res) => {
  try {
    await stripeService.reactivateSubscription(req.user._id);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    logger.error('Error reactivating subscription:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reactivate subscription'
    });
  }
};

/**
 * Sync subscription from Stripe (recover from failed webhooks)
 */
exports.syncSubscription = async (req, res) => {
  try {
    console.log('🔄 Syncing subscription for user:', req.user._id);
    const result = await stripeService.syncSubscriptionFromStripe(req.user._id);

    res.json({
      success: true,
      message: result.message,
      subscription: result.subscription
    });
  } catch (error) {
    console.error('❌ Error syncing subscription:', error.message);
    logger.error('Error syncing subscription:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync subscription'
    });
  }
};
