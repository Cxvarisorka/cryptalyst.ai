const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
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
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['text', 'video', 'interactive', 'quiz'],
      default: 'text',
    },
    // For interactive lessons
    interactiveContent: {
      type: {
        type: String,
        enum: ['code', 'simulation', 'exercise'],
      },
      initialCode: String,
      solution: String,
      hints: [String],
      validation: String, // JavaScript validation code
    },
    // For quiz lessons
    quiz: {
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number, // index of correct option
          explanation: String,
        },
      ],
    },
    // Multi-language support
    translations: {
      type: Map,
      of: {
        title: String,
        content: String,
        quiz: {
          questions: [
            {
              question: String,
              options: [String],
              explanation: String,
            },
          ],
        },
      },
      default: new Map(),
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 5,
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
lessonSchema.index({ sectionId: 1, order: 1 });
lessonSchema.index({ courseId: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
