const mongoose = require('mongoose');

/**
 * Notification Model
 * Represents notifications for user actions (follows, likes, comments, etc.)
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for system notifications
    },
    type: {
      type: String,
      enum: ['follow', 'like', 'comment', 'mention', 'price_alert'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Reference to the related entity (post, comment, etc.)
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Post', 'Comment', 'Portfolio', 'PriceAlert'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
