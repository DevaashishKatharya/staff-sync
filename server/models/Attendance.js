const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: String, // Stored as YYYY-MM-DD string for reliable uniqueness per day
      required: [true, 'Date string is required'],
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day', 'Absent', 'On Leave'],
      default: 'Present',
    },
    workHours: {
      type: Number, // Computed in hours
      default: 0,
    },
    location: {
      type: String,
      enum: ['Office', 'Remote', 'Hybrid'],
      default: 'Office',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
