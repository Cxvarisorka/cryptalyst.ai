const express = require('express');
const {
  getPortfolio,
  addAsset,
  updateAsset,
  removeAsset,
  clearPortfolio
} = require('../controllers/portfolio.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All portfolio routes require authentication
router.use(protect);

// GET /api/portfolio - Get all portfolio items for the authenticated user
router.get('/', getPortfolio);

// POST /api/portfolio - Add an asset to the portfolio
router.post('/', addAsset);

// PUT /api/portfolio/:id - Update asset quantity or purchase price
router.put('/:id', updateAsset);

// DELETE /api/portfolio/:id - Remove an asset from the portfolio
router.delete('/:id', removeAsset);

// DELETE /api/portfolio - Clear entire portfolio
router.delete('/', clearPortfolio);

module.exports = router;
