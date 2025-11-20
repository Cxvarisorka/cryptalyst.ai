const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// Market data routes
router.get('/crypto', marketController.getCryptoData);
router.get('/stocks', marketController.getStockData);
router.get('/all', marketController.getAllMarketData);
router.get('/health', marketController.getHealth);

module.exports = router;
