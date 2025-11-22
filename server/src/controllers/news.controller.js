const newsService = require('../services/news.service');

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
