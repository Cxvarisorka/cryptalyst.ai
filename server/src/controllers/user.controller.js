const User = require('../models/user.model');
const Portfolio = require('../models/portfolio.model');
const marketDataService = require('../services/marketData.service');

/**
 * Get all public users (for community page)
 * GET /api/users
 * Query params: search (optional)
 */
exports.getPublicUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Build query for public profiles
    const query = {
      'settings.privacy.profileVisibility': 'public',
      isActive: true
    };

    // Add search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with limited fields
    const users = await User.find(query)
      .select('name email avatar createdAt settings.privacy')
      .sort('-createdAt')
      .limit(50);

    // Get portfolio stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const userObj = user.toObject();

      // Only include portfolio stats if showPortfolio is true
      if (user.settings?.privacy?.showPortfolio) {
        const portfolio = await Portfolio.find({ userId: user._id });
        console.log(`[Portfolio Debug] User ${user.name} (${user._id}): Found ${portfolio.length} assets`);

        // Get market data
        const cryptoData = marketDataService.getCryptoData(1000);
        const stockData = marketDataService.getStockData(1000);
        console.log(`[Market Data] Crypto: ${cryptoData.data.length} items, Stock: ${stockData.data.length} items`);

        // Calculate total value by fetching current prices
        let totalValue = 0;
        for (const asset of portfolio) {
          let currentPrice = 0;
          console.log(`[Asset] Processing: ${asset.assetId} (${asset.assetType}), Quantity: ${asset.quantity}`);

          if (asset.assetType === 'crypto') {
            const crypto = cryptoData.data.find(c => c.id === asset.assetId);
            currentPrice = crypto ? crypto.price : 0;
            console.log(`[Crypto Match] ${asset.assetId}: ${crypto ? `Found - Price: $${crypto.price}` : 'NOT FOUND'}`);
          } else if (asset.assetType === 'stock') {
            const stock = stockData.data.find(s => s.symbol === asset.assetId);
            currentPrice = stock ? stock.price : 0;
            console.log(`[Stock Match] ${asset.assetId}: ${stock ? `Found - Price: $${stock.price}` : 'NOT FOUND'}`);
          }

          const assetValue = currentPrice * (asset.quantity || 1);
          totalValue += assetValue;
          console.log(`[Calculation] Asset value: $${assetValue.toFixed(2)}, Running total: $${totalValue.toFixed(2)}`);
        }

        const assetCount = portfolio.length;

        userObj.portfolioStats = {
          totalValue,
          assetCount
        };
      } else {
        userObj.portfolioStats = null;
      }

      return userObj;
    }));

    res.json({
      success: true,
      data: usersWithStats
    });
  } catch (error) {
    console.error('Error getting public users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public users',
      error: error.message
    });
  }
};

/**
 * Get a specific user's public profile
 * GET /api/users/:userId
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user
    const user = await User.findById(userId)
      .select('name email avatar createdAt settings.privacy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is public
    if (user.settings?.privacy?.profileVisibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'This profile is private',
        data: {
          name: user.name,
          isPrivate: true
        }
      });
    }

    const userObj = user.toObject();

    // Get portfolio if user allows it
    if (user.settings?.privacy?.showPortfolio) {
      const portfolio = await Portfolio.find({ userId: user._id });
      console.log(`[Profile Debug] User ${user.name} (${user._id}): Found ${portfolio.length} assets`);

      // Get market data
      const cryptoData = marketDataService.getCryptoData(1000);
      const stockData = marketDataService.getStockData(1000);
      console.log(`[Profile Market Data] Crypto: ${cryptoData.data.length} items, Stock: ${stockData.data.length} items`);

      // Enrich portfolio with current market data
      const enrichedAssets = portfolio.map(asset => {
        let currentPrice = 0;
        let change24h = 0;
        let marketData = null;
        console.log(`[Profile Asset] Processing: ${asset.assetId} (${asset.assetType}), Quantity: ${asset.quantity}`);

        if (asset.assetType === 'crypto') {
          marketData = cryptoData.data.find(c => c.id === asset.assetId);
          if (marketData) {
            currentPrice = marketData.price;
            change24h = marketData.change24h || 0;
            console.log(`[Profile Crypto Match] ${asset.assetId}: Found - Price: $${marketData.price}, Change: ${marketData.change24h}%`);
          } else {
            console.log(`[Profile Crypto Match] ${asset.assetId}: NOT FOUND in market data`);
          }
        } else if (asset.assetType === 'stock') {
          marketData = stockData.data.find(s => s.symbol === asset.assetId);
          if (marketData) {
            currentPrice = marketData.price;
            change24h = marketData.change24h || 0;
            console.log(`[Profile Stock Match] ${asset.assetId}: Found - Price: $${marketData.price}, Change: ${marketData.change24h}%`);
          } else {
            console.log(`[Profile Stock Match] ${asset.assetId}: NOT FOUND in market data`);
          }
        }

        return {
          _id: asset._id,
          assetId: asset.assetId,
          assetType: asset.assetType,
          quantity: asset.quantity,
          name: asset.name || (marketData ? marketData.name : asset.assetId),
          symbol: asset.symbol || (marketData ? marketData.symbol : asset.assetId),
          image: asset.image || (marketData ? marketData.image : null),
          price: currentPrice,
          change24h: change24h
        };
      });

      // Calculate portfolio metrics
      let totalValue = 0;
      let dayChange = 0;

      enrichedAssets.forEach(asset => {
        const value = asset.price * (asset.quantity || 1);
        totalValue += value;
        dayChange += (value * asset.change24h / 100);
        console.log(`[Profile Calc] ${asset.assetId}: Value = $${value.toFixed(2)}, Running Total = $${totalValue.toFixed(2)}`);
      });

      const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;
      console.log(`[Profile Final] Total Value: $${totalValue.toFixed(2)}, Day Change: $${dayChange.toFixed(2)} (${dayChangePercent.toFixed(2)}%)`);
      console.log(`[Profile Final] Asset Count: ${portfolio.length}`);

      userObj.portfolio = {
        assets: enrichedAssets,
        metrics: {
          totalValue,
          dayChange,
          dayChangePercent,
          assetCount: portfolio.length
        }
      };
    } else {
      userObj.portfolio = null;
    }

    res.json({
      success: true,
      data: userObj
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

/**
 * Get current user's own profile (authenticated)
 * GET /api/users/me
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting own profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};
