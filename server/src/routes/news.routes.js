const express = require('express');
const { getCryptoNews, getStockNews } = require('../controllers/news.controller');

const router = express.Router();

// GET /api/news/crypto/:symbol - Get news for a cryptocurrency
// Query params: limit (optional, default 10)
router.get('/crypto/:symbol', getCryptoNews);

// GET /api/news/stock/:symbol - Get news for a stock
// Query params: companyName (optional), limit (optional, default 10)
router.get('/stock/:symbol', getStockNews);

module.exports = router;
