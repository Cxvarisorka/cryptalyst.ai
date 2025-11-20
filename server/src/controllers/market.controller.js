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
