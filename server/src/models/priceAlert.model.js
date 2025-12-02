const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assetType: {
    type: String,
    enum: ['crypto', 'stock'],
    required: true
  },
  assetId: {
    type: String,
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  assetSymbol: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: ['above', 'below'],
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  lastChecked: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying of active alerts
priceAlertSchema.index({ userId: 1, isActive: 1 });
priceAlertSchema.index({ isActive: 1, triggered: 0 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
