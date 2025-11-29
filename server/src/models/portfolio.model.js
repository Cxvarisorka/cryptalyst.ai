const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  // Reference to the portfolio collection this asset belongs to
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortfolioCollection',
    required: false,
    index: true,
    default: null,
  },

  // Reference to the user who owns this portfolio item
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Asset identifier (crypto id like 'bitcoin' or stock symbol like 'AAPL')
  assetId: {
    type: String,
    required: [true, 'Asset ID is required'],
    trim: true
  },

  // Type of asset
  assetType: {
    type: String,
    required: [true, 'Asset type is required'],
    enum: ['crypto', 'stock'],
  },

  // Number of units owned
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.000001, 'Quantity must be positive'],
    default: 1
  },

  // Purchase price per unit (optional, for profit/loss tracking)
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price must be positive'],
    default: null
  },

  // Additional metadata
  symbol: {
    type: String,
    trim: true
  },

  name: {
    type: String,
    trim: true
  },

  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound index for userId + assetId + assetType + collection to prevent duplicates within same collection
// This allows same asset in different collections
// Using sparse: true to allow multiple null collection values
portfolioSchema.index({ userId: 1, assetId: 1, assetType: 1, collection: 1 }, { unique: true, sparse: true });

// Method to get total value (if current price is provided)
portfolioSchema.methods.calculateValue = function(currentPrice) {
  return this.quantity * currentPrice;
};

// Method to calculate profit/loss percentage
portfolioSchema.methods.calculateProfitLoss = function(currentPrice) {
  if (!this.purchasePrice) return null;
  return ((currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
