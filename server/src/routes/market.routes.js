const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// Market data routes
router.get('/crypto/search', marketController.searchCrypto);
router.get('/crypto/:id', marketController.getCryptoById);
router.get('/crypto', marketController.getCryptoData);
router.get('/stocks/search', marketController.searchStock);
router.get('/stock/:symbol', marketController.getStockBySymbol);
router.get('/stocks', marketController.getStockData);
router.get('/all', marketController.getAllMarketData);
router.get('/health', marketController.getHealth);

module.exports = router;
