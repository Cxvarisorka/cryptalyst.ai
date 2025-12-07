const express = require('express');
const {
  getCryptoNews,
  getStockNews,
  getNewsByCategory,
  getNewsBySymbols,
  searchNews
} = require('../controllers/news.controller');

const router = express.Router();

// GET /api/news - Get general news by category
// Query params: category (all, crypto, stocks, political), limit (optional, default 30)
router.get('/', getNewsByCategory);

// GET /api/news/symbols - Get news for specific symbols
// Query params: symbols (comma-separated), limit (optional, default 20)
router.get('/symbols', getNewsBySymbols);

// GET /api/news/search - Search news
// Query params: q (search query), limit (optional, default 20)
router.get('/search', searchNews);

// GET /api/news/crypto/:symbol - Get news for a cryptocurrency
// Query params: limit (optional, default 10)
router.get('/crypto/:symbol', getCryptoNews);

// GET /api/news/stock/:symbol - Get news for a stock
// Query params: companyName (optional), limit (optional, default 10)
router.get('/stock/:symbol', getStockNews);

module.exports = router;
