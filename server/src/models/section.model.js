const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
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
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sectionSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Section', sectionSchema);
