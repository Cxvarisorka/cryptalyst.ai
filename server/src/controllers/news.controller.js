const newsService = require('../services/news.service');
const { completeOnboardingTask } = require('../services/onboarding.service');

/**
 * Get news for a cryptocurrency
 */
exports.getCryptoNews = async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Cryptocurrency symbol is required'
      });
    }

    const news = await newsService.getCryptoNews(symbol.toUpperCase(), limit);

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cryptocurrency news',
      error: error.message
    });
  }
};

/**
 * Get news for a stock
 */
exports.getStockNews = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { companyName } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required'
      });
    }

    const news = await newsService.getStockNews(symbol.toUpperCase(), companyName, limit);

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error fetching stock news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock news',
      error: error.message
    });
  }
};

/**
 * Get general news by category
 */
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    const limit = parseInt(req.query.limit) || 30;

    const news = await newsService.getNewsByCategory(category, limit);

    // Complete onboarding task if user is authenticated
    if (req.user?.id) {
      completeOnboardingTask(req.user.id, 'viewNews').catch(() => {});
    }

    res.json({
      success: true,
      category,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

/**
 * Get news by specific symbols
 */
exports.getNewsBySymbols = async (req, res) => {
  try {
    const { symbols } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    if (!symbols) {
      return res.status(400).json({
        success: false,
        message: 'Symbols parameter is required'
      });
    }

    const symbolsArray = symbols.split(',').map(s => s.trim().toUpperCase());
    const news = await newsService.getNewsBySymbols(symbolsArray, limit);

    res.json({
      success: true,
      symbols: symbolsArray,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news by symbols:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news by symbols',
      error: error.message
    });
  }
};

/**
 * Search news
 */
exports.searchNews = async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const news = await newsService.searchNews(q, limit);

    res.json({
      success: true,
      query: q,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search news',
      error: error.message
    });
  }
};
