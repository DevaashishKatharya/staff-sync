const mongoose = require('mongoose');

const trainingProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Engineering & Tech', 'Management & Leadership', 'Design & UI/UX', 'Compliance & Security', 'Productivity'],
      default: 'Engineering & Tech',
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
    },
    department: {
      type: String,
      default: 'All',
    },
    duration: {
      type: String,
      default: '8 Hours',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed'],
      default: 'In Progress',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    enrolledEmployees: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        status: {
          type: String,
          enum: ['Not Started', 'In Progress', 'Completed'],
          default: 'In Progress',
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);
