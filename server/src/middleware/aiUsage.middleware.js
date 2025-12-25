const { canPerformAnalysis, recordUsage, ANALYSIS_TYPES } = require('../services/aiUsage.service');
const logger = require('../utils/logger');

/**
 * Middleware to check if user can perform AI analysis
 * Must be used after auth middleware (protect)
 */
const checkAIUsage = (analysisType) => {
  return async (req, res, next) => {
    try {
      // If user is not authenticated, block the request
      // The protect middleware should have already blocked this, but double-check
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to use AI analysis',
          upgradeRequired: false
        });
      }

      const result = await canPerformAnalysis(req.user.id, analysisType);

      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          message: result.message || 'AI usage limit exceeded',
          reason: result.reason,
          usage: result.usage,
          upgradeRequired: true
        });
      }

      // Attach usage info and analysis type to request for later recording
      req.aiUsage = {
        analysisType,
        cost: result.cost,
        usage: result.usage
      };

      next();
    } catch (error) {
      logger.error('AI usage middleware error:', error);
      // Don't block the request on error, just log it
      next();
    }
  };
};

/**
 * Middleware to record AI usage after successful response
 * Should be called after the analysis is completed successfully
 */
const recordAIUsage = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to intercept successful responses
  res.json = function(data) {
    // Only record usage for successful responses
    if (data.success && req.aiUsage && req.user?.id) {
      const { analysisType } = req.aiUsage;
      const assetId = req.params.id || req.params.symbol || null;

      // Record usage asynchronously (don't block response)
      recordUsage(req.user.id, analysisType, assetId)
        .then(usage => {
          // Add usage info to response
          data.usage = usage;
        })
        .catch(err => {
          logger.error('Error recording AI usage:', err);
        });
    }

    return originalJson(data);
  };

  next();
};

/**
 * Helper middleware that combines check and record
 * Use this for analysis endpoints
 */
const withAIUsageTracking = (analysisType) => {
  return [checkAIUsage(analysisType), recordAIUsage];
};

module.exports = {
  checkAIUsage,
  recordAIUsage,
  withAIUsageTracking,
  ANALYSIS_TYPES
};
