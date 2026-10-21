const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewPeriod: {
      type: String,
      required: [true, 'Review period is required (e.g., Q1 2026)'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1 to 5)'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    feedback: {
      type: String,
      required: [true, 'Feedback is required'],
      trim: true,
    },
    goalsMet: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGoals: {
      type: Number,
      default: 0,
      min: 0,
    },
    keyAchievements: [
      {
        type: String,
        trim: true,
      },
    ],
    areasOfImprovement: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Performance', performanceSchema);
