const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');

// Technical analysis routes
router.get('/crypto/:id', analysisController.getCryptoAnalysis);
router.get('/stock/:symbol', analysisController.getStockAnalysis);

// Price history routes
router.get('/price-history/:type/:id', analysisController.getPriceHistory);

// Complete analysis (asset + technical + price history)
router.get('/complete/:type/:id', analysisController.getCompleteAnalysis);

module.exports = router;
