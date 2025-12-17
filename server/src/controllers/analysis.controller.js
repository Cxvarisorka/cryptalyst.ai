const technicalAnalysisService = require('../services/technicalAnalysis.service');
const priceHistoryService = require('../services/priceHistory.service');
const marketDataService = require('../services/marketData.service');
const { completeOnboardingTask } = require('../services/onboarding.service');

/**
 * Get technical analysis for a crypto asset
 * GET /api/analysis/crypto/:id
 */
exports.getCryptoAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const cryptoData = await marketDataService.getCryptoData(100);

    // Find the specific crypto
    const crypto = cryptoData?.data?.find(c => c.id === id);

    if (!crypto) {
      return res.status(404).json({
        success: false,
        message: 'Cryptocurrency not found'
      });
    }

    // Calculate technical analysis
    const analysis = technicalAnalysisService.getCryptoTechnicalAnalysis(crypto);

    // Complete onboarding task if user is authenticated
    if (req.user?.id) {
      completeOnboardingTask(req.user.id, 'useCryptoAnalyzer').catch(() => {});
    }

    res.json({
      success: true,
      data: {
        asset: crypto,
        analysis
      }
    });
  } catch (error) {
    console.error('Error getting crypto analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crypto analysis',
      error: error.message
    });
  }
};

/**
 * Get technical analysis for a stock asset
 * GET /api/analysis/stock/:symbol
 */
exports.getStockAnalysis = async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await marketDataService.getStockData(100);

    // Find the specific stock
    const stock = stockData?.data?.find(s => s.symbol === symbol);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    // Calculate technical analysis
    const analysis = technicalAnalysisService.getStockTechnicalAnalysis(stock);

    // Complete onboarding task if user is authenticated
    if (req.user?.id) {
      completeOnboardingTask(req.user.id, 'useStockAnalyzer').catch(() => {});
    }

    res.json({
      success: true,
      data: {
        asset: stock,
        analysis
      }
    });
  } catch (error) {
    console.error('Error getting stock analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock analysis',
      error: error.message
    });
  }
};

/**
 * Get price history for an asset
 * GET /api/analysis/price-history/:type/:id
 * Query params: timeframe (24H, 7D, 1M, 1Y)
 */
exports.getPriceHistory = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { timeframe = '1M' } = req.query;

    let asset;
    if (type === 'crypto') {
      const cryptoData = await marketDataService.getCryptoData(100);
      asset = cryptoData?.data?.find(c => c.id === id);
    } else if (type === 'stock') {
      const stockData = await marketDataService.getStockData(100);
      asset = stockData?.data?.find(s => s.symbol === id);
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Generate price history based on timeframe
    let priceData;
    let stats;

    switch (timeframe) {
      case '24H':
        priceData = priceHistoryService.generateIntradayData(asset.price, asset.change24h);
        break;
      case '7D':
        priceData = priceHistoryService.generateWeeklyData(asset.price, asset.change24h);
        break;
      case '1M':
        priceData = priceHistoryService.generateMonthlyData(asset.price, asset.change24h);
        break;
      case '1Y':
        priceData = priceHistoryService.generateYearlyData(asset.price, asset.change24h);
        break;
      default:
        priceData = priceHistoryService.generateMonthlyData(asset.price, asset.change24h);
    }

    stats = priceHistoryService.calculatePriceStats(priceData);

    res.json({
      success: true,
      data: {
        asset: {
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          currentPrice: asset.price,
          change24h: asset.change24h
        },
        timeframe,
        priceData,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price history',
      error: error.message
    });
  }
};

/**
 * Get complete asset details with analysis and price history
 * GET /api/analysis/complete/:type/:id
 */
exports.getCompleteAnalysis = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { timeframe = '1M' } = req.query;

    let asset;
    let analysis;

    if (type === 'crypto') {
      const cryptoData = await marketDataService.getCryptoData(100);
      asset = cryptoData?.data?.find(c => c.id === id);
      if (asset) {
        analysis = technicalAnalysisService.getCryptoTechnicalAnalysis(asset);
      }
    } else if (type === 'stock') {
      const stockData = await marketDataService.getStockData(100);
      asset = stockData?.data?.find(s => s.symbol === id);
      if (asset) {
        analysis = technicalAnalysisService.getStockTechnicalAnalysis(asset);
      }
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Generate price history
    let priceData;
    switch (timeframe) {
      case '24H':
        priceData = priceHistoryService.generateIntradayData(asset.price, asset.change24h);
        break;
      case '7D':
        priceData = priceHistoryService.generateWeeklyData(asset.price, asset.change24h);
        break;
      case '1M':
        priceData = priceHistoryService.generateMonthlyData(asset.price, asset.change24h);
        break;
      case '1Y':
        priceData = priceHistoryService.generateYearlyData(asset.price, asset.change24h);
        break;
      default:
        priceData = priceHistoryService.generateMonthlyData(asset.price, asset.change24h);
    }

    const stats = priceHistoryService.calculatePriceStats(priceData);

    res.json({
      success: true,
      data: {
        asset,
        analysis,
        priceHistory: {
          timeframe,
          data: priceData,
          stats
        }
      }
    });
  } catch (error) {
    console.error('Error getting complete analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get complete analysis',
      error: error.message
    });
  }
};
