const logger = require('../utils/logger');

/**
 * Middleware to check if user has an active subscription
 */
exports.requireSubscription = (allowedPlans = ['basic', 'premium']) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
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

      // Check if user has access
      const hasAccess = (isTrialing || isActive) &&
                       allowedPlans.includes(subscription.plan);

      logger.debug('Subscription check', {
        plan: subscription.plan,
        status: subscription.status,
        isTrialing,
        isActive,
        hasAccess,
        allowedPlans
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'This feature requires an active subscription',
          requiresSubscription: true,
          currentPlan: subscription.plan || 'free',
          debug: {
            plan: subscription.plan,
            status: subscription.status,
            isTrialing,
            isActive,
            trialEndsAt: subscription.trialEndsAt,
            currentPeriodEnd: subscription.currentPeriodEnd
          }
        });
      }

      next();
    } catch (error) {
      logger.error('Subscription middleware error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to verify subscription'
      });
    }
  };
};

/**
 * Middleware to check if user has a specific plan or higher
 */
exports.requirePlan = (minPlan) => {
  const planHierarchy = {
    free: 0,
    basic: 1,
    premium: 2
  };

  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
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

      const currentPlan = subscription.plan || 'free';
      const currentPlanLevel = planHierarchy[currentPlan] || 0;
      const requiredPlanLevel = planHierarchy[minPlan] || 0;

      // Allow access if plan level is sufficient AND subscription is active (or on trial)
      const hasAccess = currentPlanLevel >= requiredPlanLevel &&
                       (currentPlan === 'free' || isTrialing || isActive);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `This feature requires the ${minPlan} plan or higher`,
          requiresSubscription: true,
          currentPlan: currentPlan,
          requiredPlan: minPlan
        });
      }

      next();
    } catch (error) {
      logger.error('Subscription middleware error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to verify subscription'
      });
    }
  };
};

/**
 * Add subscription info to response
 */
exports.attachSubscriptionInfo = async (req, res, next) => {
  try {
    if (req.user) {
      const subscription = req.user.subscription || {};
      const now = new Date();

      const isTrialing = subscription.status === 'trialing' &&
                        subscription.trialEndsAt &&
                        subscription.trialEndsAt > now;

      const isActive = subscription.status === 'active' &&
                      subscription.currentPeriodEnd &&
                      subscription.currentPeriodEnd > now;

      req.subscriptionInfo = {
        plan: subscription.plan || 'free',
        status: subscription.status,
        isTrialing,
        isActive: isTrialing || isActive,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false
      };
    }

    next();
  } catch (error) {
    logger.error('Error attaching subscription info:', error.message);
    next();
  }
};
