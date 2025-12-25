const { getUsageStats, canPerformAnalysis } = require('../services/aiUsage.service');
const { SUBSCRIPTION_PLANS, AI_USAGE_LIMITS, ANALYSIS_TYPES } = require('../config/stripe.config');

/**
 * Get AI usage statistics for the authenticated user
 * GET /api/usage/stats
 */
exports.getUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUsageStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting AI usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics',
      error: error.message
    });
  }
};

/**
 * Check if user can perform a specific analysis type
 * GET /api/usage/check/:type
 */
exports.checkUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;

    // Validate analysis type
    const validTypes = Object.values(ANALYSIS_TYPES);
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid analysis type. Valid types: ${validTypes.join(', ')}`
      });
    }

    const result = await canPerformAnalysis(userId, type);

    res.json({
      success: true,
      data: {
        allowed: result.allowed,
        reason: result.reason,
        message: result.message,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Error checking AI usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage',
      error: error.message
    });
  }
};

/**
 * Get plan limits information
 * GET /api/usage/limits
 */
exports.getPlanLimits = async (req, res) => {
  try {
    const currentPlan = req.user?.subscription?.plan || 'free';
    const currentLimits = AI_USAGE_LIMITS[currentPlan] || AI_USAGE_LIMITS.free;

    // Return all plan limits for comparison
    res.json({
      success: true,
      data: {
        currentPlan,
        currentLimits,
        allPlans: {
          free: {
            ...AI_USAGE_LIMITS.free,
            name: 'Free Plan',
            price: 0
          },
          basic: {
            ...AI_USAGE_LIMITS.basic,
            name: 'Basic Plan',
            price: SUBSCRIPTION_PLANS.basic.price
          },
          premium: {
            ...AI_USAGE_LIMITS.premium,
            name: 'Premium Plan',
            price: SUBSCRIPTION_PLANS.premium.price
          }
        },
        analysisTypes: ANALYSIS_TYPES
      }
    });
  } catch (error) {
    console.error('Error getting plan limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan limits',
      error: error.message
    });
  }
};
