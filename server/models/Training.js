const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'All',
      trim: true,
    },
    trainer: {
      type: String,
      required: [true, 'Trainer name is required'],
      default: 'TBD',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    capacity: {
      type: Number,
      default: 25,
      min: [1, 'Capacity must be at least 1'],
    },
    enrolledUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['enrolled', 'completed', 'dropped'],
          default: 'enrolled',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completionDate: {
          type: Date,
          default: null,
        },
        score: {
          type: Number,
          default: null,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'in_progress', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
