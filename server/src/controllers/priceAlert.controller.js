const PriceAlert = require('../models/priceAlert.model');
const notificationService = require('../services/notification.service');

// Create a new price alert
const createAlert = async (req, res) => {
  try {
    const { assetType, assetId, assetName, assetSymbol, alertType, targetPrice, currentPrice, notificationPreferences } = req.body;

    // Validate required fields
    if (!assetType || !assetId || !assetName || !assetSymbol || !alertType || !targetPrice || !currentPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate alertType
    if (!['above', 'below'].includes(alertType)) {
      return res.status(400).json({ message: 'Alert type must be either "above" or "below"' });
    }

    // Validate prices
    if (targetPrice <= 0 || currentPrice <= 0) {
      return res.status(400).json({ message: 'Prices must be positive numbers' });
    }

    // Check if alert already exists for this user and asset with same conditions
    const existingAlert = await PriceAlert.findOne({
      userId: req.user.id,
      assetType,
      assetId,
      alertType,
      targetPrice,
      isActive: true,
      triggered: false
    });

    if (existingAlert) {
      return res.status(400).json({ message: 'An identical alert already exists' });
    }

    const alert = new PriceAlert({
      userId: req.user.id,
      assetType,
      assetId,
      assetName,
      assetSymbol,
      alertType,
      targetPrice,
      currentPrice,
      notificationPreferences: notificationPreferences || { email: true, inApp: true }
    });

    await alert.save();
    res.status(201).json({ message: 'Price alert created successfully', alert });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ message: 'Failed to create price alert', error: error.message });
  }
};

// Get all alerts for the current user
const getUserAlerts = async (req, res) => {
  try {
    const { status, assetType, assetId } = req.query;

    const query = { userId: req.user.id };

    // Filter by status (active, triggered, all)
    if (status === 'active') {
      query.isActive = true;
      query.triggered = false;
    } else if (status === 'triggered') {
      query.triggered = true;
    }

    // Filter by asset type
    if (assetType && ['crypto', 'stock'].includes(assetType)) {
      query.assetType = assetType;
    }

    // Filter by specific asset ID
    if (assetId) {
      query.assetId = assetId;
    }

    const alerts = await PriceAlert.find(query).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ message: 'Failed to fetch price alerts', error: error.message });
  }
};

// Get a single alert by ID
const getAlertById = async (req, res) => {
  try {
    const alert = await PriceAlert.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ alert });
  } catch (error) {
    console.error('Error fetching price alert:', error);
    res.status(500).json({ message: 'Failed to fetch price alert', error: error.message });
  }
};

// Update an alert
const updateAlert = async (req, res) => {
  try {
    const { targetPrice, isActive, notificationPreferences } = req.body;

    const alert = await PriceAlert.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Don't allow updating triggered alerts
    if (alert.triggered) {
      return res.status(400).json({ message: 'Cannot update a triggered alert' });
    }

    // Update fields
    if (targetPrice !== undefined) {
      if (targetPrice <= 0) {
        return res.status(400).json({ message: 'Target price must be a positive number' });
      }
      alert.targetPrice = targetPrice;
    }

    if (isActive !== undefined) {
      alert.isActive = isActive;
    }

    if (notificationPreferences) {
      alert.notificationPreferences = {
        ...alert.notificationPreferences,
        ...notificationPreferences
      };
    }

    await alert.save();
    res.json({ message: 'Alert updated successfully', alert });
  } catch (error) {
    console.error('Error updating price alert:', error);
    res.status(500).json({ message: 'Failed to update price alert', error: error.message });
  }
};

// Delete an alert
const deleteAlert = async (req, res) => {
  try {
    const alert = await PriceAlert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ message: 'Failed to delete price alert', error: error.message });
  }
};

// Delete all triggered alerts for the current user
const deleteTriggeredAlerts = async (req, res) => {
  try {
    const result = await PriceAlert.deleteMany({
      userId: req.user.id,
      triggered: true
    });

    res.json({
      message: 'Triggered alerts deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting triggered alerts:', error);
    res.status(500).json({ message: 'Failed to delete triggered alerts', error: error.message });
  }
};

// Get alert statistics for the current user
const getAlertStats = async (req, res) => {
  try {
    const [activeCount, triggeredCount, totalCount] = await Promise.all([
      PriceAlert.countDocuments({ userId: req.user.id, isActive: true, triggered: false }),
      PriceAlert.countDocuments({ userId: req.user.id, triggered: true }),
      PriceAlert.countDocuments({ userId: req.user.id })
    ]);

    res.json({
      active: activeCount,
      triggered: triggeredCount,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ message: 'Failed to fetch alert stats', error: error.message });
  }
};

module.exports = {
  createAlert,
  getUserAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  deleteTriggeredAlerts,
  getAlertStats
};
