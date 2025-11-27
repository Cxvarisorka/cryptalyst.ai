const PortfolioCollection = require('../models/portfolioCollection.model');
const Portfolio = require('../models/portfolio.model');

/**
 * Get all portfolio collections for the authenticated user
 */
exports.getCollections = async (req, res) => {
  try {
    const collections = await PortfolioCollection.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });

    // Get asset counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const assetCount = await Portfolio.countDocuments({
          userId: req.user._id,
          collection: collection._id,
        });

        return {
          ...collection.toObject(),
          assetCount,
        };
      })
    );

    res.json({
      success: true,
      data: collectionsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching portfolio collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio collections',
    });
  }
};

/**
 * Get a single portfolio collection by ID
 */
exports.getCollection = async (req, res) => {
  try {
    const collection = await PortfolioCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio collection not found',
      });
    }

    // Get assets in this collection
    const assets = await Portfolio.find({
      userId: req.user._id,
      collection: collection._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...collection.toObject(),
        assets,
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio collection',
    });
  }
};

/**
 * Create a new portfolio collection
 */
exports.createCollection = async (req, res) => {
  try {
    const { name, description, visibility, color, icon } = req.body;

    // Check if user already has a collection with this name
    const existingCollection = await PortfolioCollection.findOne({
      user: req.user._id,
      name: name.trim(),
    });

    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message: 'You already have a portfolio with this name',
      });
    }

    // Check if this is the user's first portfolio
    const collectionCount = await PortfolioCollection.countDocuments({
      user: req.user._id,
    });

    const collection = new PortfolioCollection({
      user: req.user._id,
      name: name.trim(),
      description: description?.trim(),
      visibility: visibility || 'private',
      color: color || '#10b981',
      icon: icon || 'briefcase',
      isDefault: collectionCount === 0, // First portfolio is default
    });

    await collection.save();

    res.status(201).json({
      success: true,
      data: collection,
      message: 'Portfolio created successfully',
    });
  } catch (error) {
    console.error('Error creating portfolio collection:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create portfolio collection',
    });
  }
};

/**
 * Update a portfolio collection
 */
exports.updateCollection = async (req, res) => {
  try {
    const { name, description, visibility, color, icon, isDefault } = req.body;

    const collection = await PortfolioCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio collection not found',
      });
    }

    // Check if new name conflicts with existing portfolio
    if (name && name.trim() !== collection.name) {
      const existingCollection = await PortfolioCollection.findOne({
        user: req.user._id,
        name: name.trim(),
        _id: { $ne: collection._id },
      });

      if (existingCollection) {
        return res.status(400).json({
          success: false,
          message: 'You already have a portfolio with this name',
        });
      }
    }

    // Update fields
    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description?.trim();
    if (visibility) collection.visibility = visibility;
    if (color) collection.color = color;
    if (icon) collection.icon = icon;
    if (isDefault !== undefined) collection.isDefault = isDefault;

    await collection.save();

    res.json({
      success: true,
      data: collection,
      message: 'Portfolio updated successfully',
    });
  } catch (error) {
    console.error('Error updating portfolio collection:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update portfolio collection',
    });
  }
};

/**
 * Delete a portfolio collection
 */
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await PortfolioCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio collection not found',
      });
    }

    // Move assets to default collection or remove collection reference
    const defaultCollection = await PortfolioCollection.findOne({
      user: req.user._id,
      isDefault: true,
      _id: { $ne: collection._id },
    });

    if (defaultCollection) {
      // Move assets to default collection
      await Portfolio.updateMany(
        { userId: req.user._id, collection: collection._id },
        { collection: defaultCollection._id }
      );
    } else {
      // Remove collection reference from assets
      await Portfolio.updateMany(
        { userId: req.user._id, collection: collection._id },
        { collection: null }
      );
    }

    await collection.deleteOne();

    res.json({
      success: true,
      message: 'Portfolio deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting portfolio collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio collection',
    });
  }
};

/**
 * Get public portfolio collections for a user
 */
exports.getUserPublicCollections = async (req, res) => {
  try {
    const { userId } = req.params;

    const collections = await PortfolioCollection.find({
      user: userId,
      visibility: 'public',
    }).sort({ isDefault: -1, createdAt: -1 });

    // Get asset counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const assetCount = await Portfolio.countDocuments({
          userId: userId,
          collection: collection._id,
        });

        return {
          ...collection.toObject(),
          assetCount,
        };
      })
    );

    res.json({
      success: true,
      data: collectionsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching public portfolio collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio collections',
    });
  }
};
