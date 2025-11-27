const mongoose = require('mongoose');

/**
 * PortfolioCollection Model
 * Represents a named collection/folder of portfolio assets
 * Users can create multiple portfolio collections (e.g., "Retirement", "Trading", "Long-term")
 */
const portfolioCollectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Portfolio name is required'],
      trim: true,
      maxLength: [100, 'Portfolio name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'followers'],
      default: 'private',
    },
    color: {
      type: String,
      default: '#10b981', // Default green color
    },
    icon: {
      type: String,
      default: 'briefcase',
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
portfolioCollectionSchema.index({ user: 1, createdAt: -1 });
portfolioCollectionSchema.index({ user: 1, isDefault: 1 });
portfolioCollectionSchema.index({ user: 1, name: 1 }, { unique: true });

// Ensure only one default portfolio per user
portfolioCollectionSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Virtual to get portfolio assets
portfolioCollectionSchema.virtual('assets', {
  ref: 'Portfolio',
  localField: '_id',
  foreignField: 'collection',
});

portfolioCollectionSchema.set('toJSON', { virtuals: true });
portfolioCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PortfolioCollection', portfolioCollectionSchema);
