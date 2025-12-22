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
      console.log('========================================');
      console.log('🔔 STRIPE WEBHOOK: handleSubscriptionUpdate called');
      console.log('Subscription ID:', subscription.id);
      console.log('Subscription Status:', subscription.status);
      console.log('Metadata:', JSON.stringify(subscription.metadata, null, 2));
      console.log('========================================');

      const userId = subscription.metadata?.userId;
      const planType = subscription.metadata?.planType;

      if (!userId) {
        console.error('❌ ERROR: No userId in subscription metadata');
        console.error('Metadata:', JSON.stringify(subscription.metadata, null, 2));
        logger.error('No userId in subscription metadata', { metadata: subscription.metadata });
        throw new Error('No userId in subscription metadata');
      }

      if (!planType) {
        console.error('❌ ERROR: No planType in subscription metadata');
        console.error('Metadata:', JSON.stringify(subscription.metadata, null, 2));
        logger.error('No planType in subscription metadata', { metadata: subscription.metadata });
        throw new Error('No planType in subscription metadata');
      }

      console.log('🔍 Looking up user with ID:', userId);
      const user = await User.findById(userId);
      if (!user) {
        console.error('❌ ERROR: User not found for ID:', userId);
        logger.error('User not found for subscription update', { userId });
        throw new Error(`User not found for subscription update: ${userId}`);
      }

      const oldPlan = user.subscription?.plan || 'free';
      const newPlan = planType || user.subscription?.plan || 'free';

      console.log('👤 User found:', user.name);
      console.log('📊 Current Plan:', oldPlan);
      console.log('📊 New Plan:', newPlan);
      console.log('📈 Subscription Status:', subscription.status);

      // Determine trial end date
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;

      // Safely convert period dates (handle null/undefined)
      const periodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null;

      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null;

      if (trialEnd) {
        console.log('🎁 Trial ends at:', trialEnd.toISOString());
      }
      console.log('📅 Current Period Start:', periodStart ? periodStart.toISOString() : 'null');
      console.log('📅 Current Period End:', periodEnd ? periodEnd.toISOString() : 'null');

      // Update user subscription in MongoDB
      user.subscription = {
        ...user.subscription,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        plan: newPlan,
        status: subscription.status,
        trialEndsAt: trialEnd,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };

      await user.save();

      console.log('✅ SUCCESS: Subscription saved to database');
      console.log('Plan Change:', `${oldPlan} → ${newPlan}`);
      console.log('Current Period End:', user.subscription.currentPeriodEnd ? user.subscription.currentPeriodEnd.toISOString() : 'null');
      console.log('========================================\n');

      logger.webhook('Subscription saved to database', {
        userId: userId,
        oldPlan,
        newPlan,
        status: subscription.status,
        trialEnd: trialEnd,
        currentPeriodEnd: user.subscription.currentPeriodEnd
      });
    } catch (error) {
      console.error('========================================');
      console.error('❌ CRITICAL ERROR in handleSubscriptionUpdate');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('========================================\n');
      logger.error('Error handling subscription update:', error.message);
      logger.webhook('Error details', { error: error.stack });
      // Re-throw so webhook controller returns 500 and Stripe will retry
      throw error;
    }
  }

  /**
   * Sync subscription from Stripe (recover from failed webhooks)
   * This fetches the latest subscription data directly from Stripe and updates the database
   */
  async syncSubscriptionFromStripe(userId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured');
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const customerId = user.subscription?.stripeCustomerId;
      if (!customerId) {
        return {
          message: 'No Stripe customer found for this user',
          subscription: { plan: 'free', status: null }
        };
      }

      console.log('🔄 Fetching subscriptions from Stripe for customer:', customerId);

      // Get all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 1,
        expand: ['data.items.data.price']
      });

      if (!subscriptions.data || subscriptions.data.length === 0) {
        console.log('📭 No subscriptions found in Stripe');
        // Reset to free plan
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
        return {
          message: 'No active subscription found in Stripe, reset to free plan',
          subscription: { plan: 'free', status: null }
        };
      }

      const subscription = subscriptions.data[0];
      console.log('📦 Found subscription:', subscription.id, 'Status:', subscription.status);

      // Determine plan type from price ID
      const priceId = subscription.items.data[0]?.price?.id;
      let planType = 'free';

      if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
        planType = 'basic';
      } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
        planType = 'premium';
      } else {
        // Try to get from metadata
        planType = subscription.metadata?.planType || 'basic';
      }

      console.log('📊 Detected plan type:', planType);

      // Update user subscription
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;
      const periodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null;
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null;

      user.subscription = {
        ...user.subscription,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        plan: planType,
        status: subscription.status,
        trialEndsAt: trialEnd,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };

      await user.save();

      console.log('✅ Subscription synced successfully:', planType);

      return {
        message: `Subscription synced successfully: ${planType} plan`,
        subscription: {
          plan: planType,
          status: subscription.status,
          trialEndsAt: trialEnd,
          currentPeriodEnd: periodEnd
        }
      };
    } catch (error) {
      console.error('❌ Error syncing subscription:', error.message);
      logger.error('Error syncing subscription:', error.message);
      throw error;
    }
  }

  /**
   * Handle subscription deleted
   * Called when subscription is canceled and period has ended
   */
  async handleSubscriptionDeleted(subscription) {
    try {
      const userId = subscription.metadata?.userId;

      if (!userId) {
        logger.error('No userId in subscription metadata for deletion');
        throw new Error('No userId in subscription metadata for deletion');
      }

      const user = await User.findById(userId);

      if (!user) {
        logger.error('User not found for subscription deletion');
        throw new Error(`User not found for subscription deletion: ${userId}`);
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
      throw error;
    }
  }
}

module.exports = new StripeService();
