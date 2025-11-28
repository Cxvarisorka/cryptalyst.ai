const PortfolioCollection = require('../models/portfolioCollection.model');
const Portfolio = require('../models/portfolio.model');

/**
 * Utility: Get asset counts for collections (fast, single aggregation)
 */
async function getAssetCounts(userId) {
  const result = await Portfolio.aggregate([
    { $match: { userId } },
    { $group: { _id: "$collection", count: { $sum: 1 } } }
  ]);

  const countMap = {};
  result.forEach(r => countMap[r._id?.toString()] = r.count);
  return countMap;
}

/**
 * Get all portfolio collections
 */
exports.getCollections = async (req, res) => {
  try {
    const collections = await PortfolioCollection
      .find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    const counts = await getAssetCounts(req.user._id);

    const result = collections.map(col => ({
      ...col,
      assetCount: counts[col._id.toString()] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching portfolio collections:", error);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio collections" });
  }
};

/**
 * Get one portfolio collection
 */
exports.getCollection = async (req, res) => {
  try {
    const collection = await PortfolioCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Portfolio collection not found"
      });
    }

    const assets = await Portfolio.find({
      userId: req.user._id,
      collection: collection._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { ...collection, assets }
    });
  } catch (error) {
    console.error("Error fetching portfolio collection:", error);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio collection" });
  }
};

/**
 * Create a new collection
 */
exports.createCollection = async (req, res) => {
  try {
    let { name, description, visibility, color, icon } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    name = name.trim();

    // Validate visibility
    const allowedVisibility = ["private", "public"];
    if (visibility && !allowedVisibility.includes(visibility)) {
      return res.status(400).json({ success: false, message: "Invalid visibility value" });
    }

    // Check duplicate name
    const existing = await PortfolioCollection.findOne({
      user: req.user._id,
      name,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a portfolio with this name",
      });
    }

    const count = await PortfolioCollection.countDocuments({ user: req.user._id });

    const collection = new PortfolioCollection({
      user: req.user._id,
      name,
      description: description?.trim() || "",
      visibility: visibility || "private",
      color: color || "#10b981",
      icon: icon || "briefcase",
      isDefault: count === 0,
    });

    await collection.save();

    res.status(201).json({
      success: true,
      data: collection,
      message: "Portfolio created successfully",
    });
  } catch (error) {
    console.error("Error creating portfolio collection:", error);
    res.status(500).json({ success: false, message: error.message });
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
      return res.status(404).json({ success: false, message: "Portfolio collection not found" });
    }

    // Check name duplicates
    if (name && name.trim() !== collection.name) {
      const existing = await PortfolioCollection.findOne({
        user: req.user._id,
        name: name.trim(),
        _id: { $ne: collection._id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You already have a portfolio with this name",
        });
      }
    }

    // Validate visibility
    const allowedVisibility = ["private", "public"];
    if (visibility && !allowedVisibility.includes(visibility)) {
      return res.status(400).json({ success: false, message: "Invalid visibility value" });
    }

    // Handle default logic
    if (isDefault === true) {
      await PortfolioCollection.updateMany(
        { user: req.user._id, _id: { $ne: collection._id } },
        { isDefault: false }
      );
      collection.isDefault = true;
    }

    if (isDefault === false && collection.isDefault) {
      return res.status(400).json({
        success: false,
        message: "You cannot unset the only default portfolio",
      });
    }

    // Update fields
    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description?.trim() || "";
    if (visibility) collection.visibility = visibility;
    if (color) collection.color = color;
    if (icon) collection.icon = icon;

    await collection.save();

    res.json({
      success: true,
      data: collection,
      message: "Portfolio updated successfully",
    });
  } catch (error) {
    console.error("Error updating portfolio collection:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a collection
 */
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await PortfolioCollection.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: "Portfolio collection not found" });
    }

    // If default, find another collection to promote
    if (collection.isDefault) {
      const newDefault = await PortfolioCollection.findOne({
        user: req.user._id,
        _id: { $ne: collection._id }
      });

      if (!newDefault) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your only portfolio",
        });
      }

      newDefault.isDefault = true;
      await newDefault.save();
    }

    // Move assets to new default
    const defaultCollection = await PortfolioCollection.findOne({
      user: req.user._id,
      isDefault: true,
    });

    await Portfolio.updateMany(
      { userId: req.user._id, collection: collection._id },
      { collection: defaultCollection._id }
    );

    await collection.deleteOne();

    res.json({ success: true, message: "Portfolio deleted successfully" });
  } catch (error) {
    console.error("Error deleting portfolio collection:", error);
    res.status(500).json({ success: false, message: "Failed to delete portfolio collection" });
  }
};

/**
 * Public collections of a user
 */
exports.getUserPublicCollections = async (req, res) => {
  try {
    const collections = await PortfolioCollection.find({
      user: req.params.userId,
      visibility: "public",
    }).sort({ isDefault: -1, createdAt: -1 }).lean();

    const counts = await getAssetCounts(req.params.userId);

    const result = collections.map(col => ({
      ...col,
      assetCount: counts[col._id.toString()] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching public portfolio collections:", error);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio collections" });
  }
};
