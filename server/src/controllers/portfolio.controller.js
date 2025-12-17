const Portfolio = require('../models/portfolio.model');
const marketDataService = require('../services/marketData.service');
const { completeOnboardingTask } = require('../services/onboarding.service');

/**
 * Get all portfolio items for the authenticated user
 */
exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { collection } = req.query;

    // Build query filter
    const filter = { userId };
    // Only filter by collection if a valid collection ID is provided
    if (collection && collection !== 'undefined' && collection !== 'null') {
      filter.collection = collection;
    }

    console.log('Portfolio filter:', filter);

    const portfolioItems = await Portfolio.find(filter).sort({ createdAt: -1 });

    console.log(`Found ${portfolioItems.length} portfolio items`);

    const enrichedPortfolio = await Promise.all(
      portfolioItems.map(async (item) => {
        try {
          let currentData = null;

          // Fetch live market data
          if (item.assetType === 'crypto') {
            currentData = await marketDataService.getCryptoById(item.assetId);
          } else if (item.assetType === 'stock') {
            currentData = await marketDataService.getStockBySymbol(item.assetId);
          }

          // Ensure currentData is safe
          const live = currentData || {};

          return {
            _id: item._id,
            id: item.assetId,
            type: item.assetType,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            symbol: live.symbol ?? item.symbol,
            name: live.name ?? item.name,
            image: live.image ?? item.image,
            price: live.price ?? 0,
            change24h: live.change24h ?? 0,
            marketCap: live.marketCap ?? 0,
            addedAt: item.createdAt,
          };
        } catch (error) {
          console.error(`Error enriching ${item.assetType} ${item.assetId}:`, error.message);

          // Fallback to saved data
          return {
            _id: item._id,
            id: item.assetId,
            type: item.assetType,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            symbol: item.symbol,
            name: item.name,
            image: item.image,
            price: 0,
            change24h: 0,
            marketCap: 0,
            addedAt: item.createdAt,
          };
        }
      })
    );

    res.json({
      success: true,
      count: enrichedPortfolio.length,
      data: enrichedPortfolio,
    });

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message,
    });
  }
};


/**
 * Add an asset to the portfolio
 */
exports.addAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, assetType, quantity, purchasePrice, symbol, name, image, collection } = req.body;

    // Validate required fields
    if (!assetId || !assetType) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID and type are required'
      });
    }

    // If no collection specified, get user's default collection
    let targetCollection = collection;
    if (!targetCollection) {
      const PortfolioCollection = require('../models/portfolioCollection.model');
      const defaultCollection = await PortfolioCollection.findOne({
        user: userId,
        isDefault: true
      });

      if (!defaultCollection) {
        return res.status(400).json({
          success: false,
          message: 'No default portfolio found. Please create a portfolio first.'
        });
      }

      targetCollection = defaultCollection._id;
    }

    // Check if asset already exists in this specific collection
    const existingAsset = await Portfolio.findOne({
      userId,
      assetId,
      assetType,
      collection: targetCollection
    });

    if (existingAsset) {
      // Update quantity if asset already exists in this collection
      existingAsset.quantity += quantity || 1;
      await existingAsset.save();

      return res.json({
        success: true,
        message: 'Asset quantity updated',
        data: existingAsset
      });
    }

    // Create new portfolio item
    const portfolioItem = new Portfolio({
      userId,
      assetId,
      assetType,
      quantity: quantity || 1,
      purchasePrice,
      symbol,
      name,
      image,
      collection: targetCollection
    });

    await portfolioItem.save();

    // Complete onboarding task (async, don't wait)
    completeOnboardingTask(userId, 'createPortfolio').catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Asset added to portfolio',
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error adding asset to portfolio:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Asset already exists in portfolio'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add asset to portfolio',
      error: error.message
    });
  }
};

/**
 * Update asset quantity or purchase price
 */
exports.updateAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity, purchasePrice } = req.body;

    const portfolioItem = await Portfolio.findOne({ _id: id, userId });

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Update fields
    if (quantity !== undefined) portfolioItem.quantity = quantity;
    if (purchasePrice !== undefined) portfolioItem.purchasePrice = purchasePrice;

    await portfolioItem.save();

    res.json({
      success: true,
      message: 'Portfolio item updated',
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio item',
      error: error.message
    });
  }
};

/**
 * Remove an asset from the portfolio
 */
exports.removeAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const portfolioItem = await Portfolio.findOneAndDelete({ _id: id, userId });

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.json({
      success: true,
      message: 'Asset removed from portfolio',
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error removing asset from portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove asset from portfolio',
      error: error.message
    });
  }
};

/**
 * Clear entire portfolio
 */
exports.clearPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Portfolio.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Portfolio cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear portfolio',
      error: error.message
    });
  }
};
