const { stripe, SUBSCRIPTION_PLANS, FREE_TRIAL_DAYS } = require('../config/stripe.config');
const User = require('../models/user.model');
const logger = require('../utils/logger');

class StripeService {
  /**
   * Check if Stripe is configured
   */
  isConfigured() {
    return stripe !== null;
  }

  /**
   * Create or get Stripe customer for user
   */
  async getOrCreateCustomer(user) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    try {
      // If user already has a customer ID, return it
      if (user.subscription?.stripeCustomerId) {
        return user.subscription.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      // Update user with customer ID
      user.subscription = user.subscription || {};
      user.subscription.stripeCustomerId = customer.id;
      await user.save();

      return customer.id;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error.message);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(userId, planType) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const plan = SUBSCRIPTION_PLANS[planType];
      if (!plan) {
        throw new Error('Invalid plan type');
      }

      const customerId = await this.getOrCreateCustomer(user);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: FREE_TRIAL_DAYS,
          metadata: {
            userId: user._id.toString(),
            planType: planType
          }
        },
        success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/pricing`,
        metadata: {
          userId: user._id.toString(),
          planType: planType
        }
      });

      return session;
    } catch (error) {
      logger.error('Error creating checkout session:', error.message);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create portal session for managing subscription
   */
  async createPortalSession(userId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    try {
      const user = await User.findById(userId);
      if (!user || !user.subscription?.stripeCustomerId) {
        throw new Error('User has no subscription');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: `${process.env.CLIENT_URL}/settings/subscription`
      });

      return session;
    } catch (error) {
      logger.error('Error creating portal session:', error.message);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    try {
      const user = await User.findById(userId);
      if (!user || !user.subscription?.stripeSubscriptionId) {
        throw new Error('User has no active subscription');
      }

      // Cancel at period end (not immediately)
      const subscription = await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );

      // Update user
      user.subscription.cancelAtPeriodEnd = true;
      await user.save();

      return subscription;
    } catch (error) {
      logger.error('Error canceling subscription:', error.message);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(userId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    try {
      const user = await User.findById(userId);
      if (!user || !user.subscription?.stripeSubscriptionId) {
        throw new Error('User has no subscription');
      }

      const subscription = await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false
        }
      );

      // Update user
      user.subscription.cancelAtPeriodEnd = false;
      await user.save();

      return subscription;
    } catch (error) {
      logger.error('Error reactivating subscription:', error.message);
      throw new Error('Failed to reactivate subscription');
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const subscription = user.subscription || {};
      const now = new Date();

      // Check if user is on free trial
      const isTrialing = subscription.status === 'trialing' &&
                        subscription.trialEndsAt &&
                        subscription.trialEndsAt > now;

      // Check if subscription is active
      const isActive = subscription.status === 'active' &&
                      subscription.currentPeriodEnd &&
                      subscription.currentPeriodEnd > now;

      return {
        plan: subscription.plan || 'free',
        status: subscription.status,
        isTrialing,
        isActive: isTrialing || isActive,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false
      };
    } catch (error) {
      logger.error('Error getting subscription status:', error.message);
      throw new Error('Failed to get subscription status');
    }
  }

  /**
   * Handle subscription created/updated
   * This is called by Stripe webhooks when:
   * 1. checkout.session.completed - Payment successful
   * 2. customer.subscription.created - New subscription
   * 3. customer.subscription.updated - Subscription modified
   */
  async handleSubscriptionUpdate(subscription) {
    try {
      logger.webhook('handleSubscriptionUpdate called', {
        subscriptionId: subscription.id,
        metadata: subscription.metadata,
        status: subscription.status
      });

      const userId = subscription.metadata?.userId;
      const planType = subscription.metadata?.planType;

      if (!userId) {
        logger.error('No userId in subscription metadata', { metadata: subscription.metadata });
        return;
      }

      if (!planType) {
        logger.error('No planType in subscription metadata', { metadata: subscription.metadata });
        return;
      }

      logger.webhook('Looking up user', { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.error('User not found for subscription update', { userId });
        return;
      }

      logger.webhook('User found', { email: '[REDACTED]', currentPlan: user.subscription?.plan || 'free' });

      const oldPlan = user.subscription?.plan || 'free';
      const newPlan = planType || user.subscription?.plan || 'free';

      // Determine trial end date
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;

      // Update user subscription in MongoDB
      user.subscription = {
        ...user.subscription,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        plan: newPlan,
        status: subscription.status,
        trialEndsAt: trialEnd,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };

      await user.save();

      logger.webhook('Subscription saved to database', {
        userId: userId,
        oldPlan,
        newPlan,
        status: subscription.status,
        trialEnd: trialEnd,
        currentPeriodEnd: user.subscription.currentPeriodEnd
      });

      logger.success('Subscription updated in database');
      logger.info(`Plan: ${oldPlan} → ${newPlan}`);
      logger.info(`Status: ${subscription.status}`);
    } catch (error) {
      logger.error('Error handling subscription update:', error.message);
      logger.webhook('Error details', { error: error.stack });
    }
  }

  /**
   * Handle subscription deleted
   * Called when subscription is canceled and period has ended
   */
  async handleSubscriptionDeleted(subscription) {
    try {
      const userId = subscription.metadata.userId;
      const user = await User.findById(userId);

      if (!user) {
        logger.error('User not found for subscription deletion');
        return;
      }

      const oldPlan = user.subscription?.plan || 'free';

      // Revert to free plan in MongoDB
      user.subscription = {
        ...user.subscription,
        stripeSubscriptionId: null,
        plan: 'free',
        status: null,
        trialEndsAt: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };

      await user.save();

      logger.success('Subscription deleted in database');
      logger.info(`Plan: ${oldPlan} → free`);
    } catch (error) {
      logger.error('Error handling subscription deletion:', error.message);
    }
  }
}

module.exports = new StripeService();
