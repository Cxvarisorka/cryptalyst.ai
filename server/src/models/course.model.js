const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['crypto', 'stocks', 'trading', 'fundamentals', 'technical-analysis'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    thumbnail: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // Multi-language support
    translations: {
      type: Map,
      of: {
        title: String,
        description: String,
      },
      default: new Map(),
    },
    // Course metadata
    estimatedDuration: {
      type: Number, // in minutes
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    completedCount: {
      type: Number,
      default: 0,
    },
    // Creator info
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ order: 1 });

module.exports = mongoose.model('Course', courseSchema);
