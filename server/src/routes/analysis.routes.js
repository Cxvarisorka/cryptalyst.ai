const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { checkAIUsage } = require('../middleware/aiUsage.middleware');
const { ANALYSIS_TYPES } = require('../config/stripe.config');

// Technical analysis routes - REQUIRES authentication for usage tracking
// Users must be logged in to access AI analysis
router.get('/crypto/:id',
  protect,
  checkAIUsage(ANALYSIS_TYPES.CRYPTO),
  analysisController.getCryptoAnalysis
);

router.get('/stock/:symbol',
  protect,
  checkAIUsage(ANALYSIS_TYPES.STOCK),
  analysisController.getStockAnalysis
);

// Price history routes (no usage tracking - just data fetching)
router.get('/price-history/:type/:id', analysisController.getPriceHistory);

// Complete analysis (asset + technical + price history) - REQUIRES authentication
router.get('/complete/:type/:id',
  protect,
  checkAIUsage(ANALYSIS_TYPES.CRYPTO), // Uses crypto type as default
  analysisController.getCompleteAnalysis
);

// Scalping AI analysis - records usage when chart is analyzed
router.post('/scalping',
  protect,
  checkAIUsage(ANALYSIS_TYPES.SCALPING),
  analysisController.recordScalpingAnalysis
);

// Record AI usage for client-side analysis (AIAnalysis component)
// This endpoint checks limits and records usage for any analysis type
router.post('/record-usage',
  protect,
  analysisController.recordClientAnalysis
);

module.exports = router;
