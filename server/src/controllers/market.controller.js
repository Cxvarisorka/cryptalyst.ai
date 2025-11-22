const marketDataService = require('../services/marketData.service');

/**
 * Get crypto market data
 * @route GET /api/market/crypto
 */
exports.getCryptoData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data = marketDataService.getCryptoData(limit);

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Error in getCryptoData controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crypto data',
      error: error.message
    });
  }
};

/**
 * Get stock market data
 * @route GET /api/market/stocks
 */
exports.getStockData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data = marketDataService.getStockData(limit);

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Error in getStockData controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock data',
      error: error.message
    });
  }
};

/**
 * Get all market data (crypto + stocks)
 * @route GET /api/market/all
 */
exports.getAllMarketData = async (req, res) => {
  try {
    const data = marketDataService.getAllMarketData();

    res.json({
      success: true,
      data,
      lastUpdate: data.lastUpdate
    });
  } catch (error) {
    console.error('Error in getAllMarketData controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data',
      error: error.message
    });
  }
};

/**
 * Get service health status
 * @route GET /api/market/health
 */
exports.getHealth = async (req, res) => {
  try {
    const data = marketDataService.getCryptoData(1);

    res.json({
      success: true,
      status: 'active',
      lastUpdate: data.lastUpdate,
      dataAvailable: data.data.length > 0,
      updateInterval: '10s'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      error: error.message
    });
  }
};

/**
 * Get single crypto by ID
 * @route GET /api/market/crypto/:id
 */
exports.getCryptoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await marketDataService.getCryptoById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Cryptocurrency not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getCryptoById controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crypto data',
      error: error.message
    });
  }
};

/**
 * Get single stock by symbol
 * @route GET /api/market/stock/:symbol
 */
exports.getStockBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await marketDataService.getStockBySymbol(symbol.toUpperCase());

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getStockBySymbol controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock data',
      error: error.message
    });
  }
};

/**
 * Search for cryptocurrencies
 * @route GET /api/market/crypto/search?q=bitcoin
 */
exports.searchCrypto = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const results = await marketDataService.searchCrypto(q);

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in searchCrypto controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search crypto',
      error: error.message
    });
  }
};

/**
 * Search for stocks
 * @route GET /api/market/stocks/search?q=apple
 */
exports.searchStock = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await marketDataService.searchStock(q);

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in searchStock controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search stocks',
      error: error.message
    });
  }
};
