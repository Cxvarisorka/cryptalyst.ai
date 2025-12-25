const User = require('../models/user.model');
const { AI_USAGE_LIMITS, ANALYSIS_TYPES } = require('../config/stripe.config');
const logger = require('../utils/logger');

/**
 * Check if daily/monthly counters need to be reset
 */
const checkAndResetCounters = async (user) => {
  const now = new Date();
  let needsSave = false;

  // Initialize aiUsage if it doesn't exist
  if (!user.aiUsage) {
    user.aiUsage = {
      dailyCount: 0,
      monthlyCount: 0,
      lastDailyReset: now,
      lastMonthlyReset: now,
      history: []
    };
    needsSave = true;
  }

  const lastDailyReset = user.aiUsage.lastDailyReset ? new Date(user.aiUsage.lastDailyReset) : new Date(0);
  const lastMonthlyReset = user.aiUsage.lastMonthlyReset ? new Date(user.aiUsage.lastMonthlyReset) : new Date(0);

  // Check if we need to reset daily counter (different day)
  if (now.toDateString() !== lastDailyReset.toDateString()) {
    user.aiUsage.dailyCount = 0;
    user.aiUsage.lastDailyReset = now;
    needsSave = true;
    logger.debug(`Reset daily AI usage counter for user ${user._id}`);
  }

  // Check if we need to reset monthly counter (different month)
  if (now.getMonth() !== lastMonthlyReset.getMonth() || now.getFullYear() !== lastMonthlyReset.getFullYear()) {
    user.aiUsage.monthlyCount = 0;
    user.aiUsage.lastMonthlyReset = now;
    // Also clear old history entries (keep last 100)
    if (user.aiUsage.history && user.aiUsage.history.length > 100) {
      user.aiUsage.history = user.aiUsage.history.slice(-100);
    }
    needsSave = true;
    logger.debug(`Reset monthly AI usage counter for user ${user._id}`);
  }

  if (needsSave) {
    await user.save();
  }

  return user;
};

/**
 * Get the current plan's AI limits for a user
 */
const getPlanLimits = (user) => {
  const plan = user.subscription?.plan || 'free';
  return AI_USAGE_LIMITS[plan] || AI_USAGE_LIMITS.free;
};

/**
 * Get the credit cost for an analysis type
 */
const getAnalysisCost = (analysisType, planLimits) => {
  if (analysisType === ANALYSIS_TYPES.PORTFOLIO) {
    return planLimits.portfolioWeight || 2;
  }
  return 1; // Default cost for crypto, stock, scalping
};

/**
 * Check if user can perform an analysis
 * Returns { allowed: boolean, reason?: string, usage: object }
 */
const canPerformAnalysis = async (userId, analysisType) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found',
        usage: null
      };
    }

    // Reset counters if needed
    await checkAndResetCounters(user);

    const limits = getPlanLimits(user);
    const cost = getAnalysisCost(analysisType, limits);

    const currentDaily = user.aiUsage?.dailyCount || 0;
    const currentMonthly = user.aiUsage?.monthlyCount || 0;

    // Check daily limit
    if (currentDaily + cost > limits.dailyLimit) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        message: `You have reached your daily limit of ${limits.dailyLimit} AI analyses. Upgrade your plan for more analyses.`,
        usage: {
          dailyUsed: currentDaily,
          dailyLimit: limits.dailyLimit,
          monthlyUsed: currentMonthly,
          monthlyLimit: limits.monthlyLimit,
          plan: user.subscription?.plan || 'free'
        }
      };
    }

    // Check monthly limit
    if (currentMonthly + cost > limits.monthlyLimit) {
      return {
        allowed: false,
        reason: 'monthly_limit_exceeded',
        message: `You have reached your monthly limit of ${limits.monthlyLimit} AI analyses. Upgrade your plan for more analyses.`,
        usage: {
          dailyUsed: currentDaily,
          dailyLimit: limits.dailyLimit,
          monthlyUsed: currentMonthly,
          monthlyLimit: limits.monthlyLimit,
          plan: user.subscription?.plan || 'free'
        }
      };
    }

    return {
      allowed: true,
      cost,
      usage: {
        dailyUsed: currentDaily,
        dailyLimit: limits.dailyLimit,
        monthlyUsed: currentMonthly,
        monthlyLimit: limits.monthlyLimit,
        dailyRemaining: limits.dailyLimit - currentDaily,
        monthlyRemaining: limits.monthlyLimit - currentMonthly,
        plan: user.subscription?.plan || 'free'
      }
    };
  } catch (error) {
    logger.error('Error checking AI usage:', error);
    return {
      allowed: false,
      reason: 'error',
      message: 'Failed to check usage limits'
    };
  }
};

/**
 * Record an AI analysis usage
 */
const recordUsage = async (userId, analysisType, assetId = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Reset counters if needed
    await checkAndResetCounters(user);

    const limits = getPlanLimits(user);
    const cost = getAnalysisCost(analysisType, limits);

    // Initialize aiUsage if needed
    if (!user.aiUsage) {
      user.aiUsage = {
        dailyCount: 0,
        monthlyCount: 0,
        lastDailyReset: new Date(),
        lastMonthlyReset: new Date(),
        history: []
      };
    }

    // Increment counters
    user.aiUsage.dailyCount = (user.aiUsage.dailyCount || 0) + cost;
    user.aiUsage.monthlyCount = (user.aiUsage.monthlyCount || 0) + cost;

    // Add to history (keep last 100 entries)
    if (!user.aiUsage.history) {
      user.aiUsage.history = [];
    }
    user.aiUsage.history.push({
      type: analysisType,
      assetId,
      credits: cost,
      timestamp: new Date()
    });

    // Trim history to last 100 entries
    if (user.aiUsage.history.length > 100) {
      user.aiUsage.history = user.aiUsage.history.slice(-100);
    }

    await user.save();

    logger.debug(`Recorded AI usage for user ${userId}: ${analysisType} (${cost} credits)`);

    return {
      dailyUsed: user.aiUsage.dailyCount,
      dailyLimit: limits.dailyLimit,
      monthlyUsed: user.aiUsage.monthlyCount,
      monthlyLimit: limits.monthlyLimit,
      dailyRemaining: limits.dailyLimit - user.aiUsage.dailyCount,
      monthlyRemaining: limits.monthlyLimit - user.aiUsage.monthlyCount,
      plan: user.subscription?.plan || 'free'
    };
  } catch (error) {
    logger.error('Error recording AI usage:', error);
    throw error;
  }
};

/**
 * Get current usage stats for a user
 */
const getUsageStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Reset counters if needed
    await checkAndResetCounters(user);

    const limits = getPlanLimits(user);
    const dailyUsed = user.aiUsage?.dailyCount || 0;
    const monthlyUsed = user.aiUsage?.monthlyCount || 0;

    return {
      dailyUsed,
      dailyLimit: limits.dailyLimit,
      dailyRemaining: Math.max(0, limits.dailyLimit - dailyUsed),
      monthlyUsed,
      monthlyLimit: limits.monthlyLimit,
      monthlyRemaining: Math.max(0, limits.monthlyLimit - monthlyUsed),
      plan: user.subscription?.plan || 'free',
      planName: user.subscription?.plan ?
        (user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)) : 'Free',
      lastDailyReset: user.aiUsage?.lastDailyReset,
      lastMonthlyReset: user.aiUsage?.lastMonthlyReset,
      recentHistory: (user.aiUsage?.history || []).slice(-10).reverse()
    };
  } catch (error) {
    logger.error('Error getting usage stats:', error);
    throw error;
  }
};

module.exports = {
  canPerformAnalysis,
  recordUsage,
  getUsageStats,
  checkAndResetCounters,
  getPlanLimits,
  getAnalysisCost,
  ANALYSIS_TYPES
};
