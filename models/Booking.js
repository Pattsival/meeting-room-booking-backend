// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingRoom',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  // เก็บรูปภาพเป็น Base64 ใน MongoDB
  bookingImage: {
    data: {
      type: String,  // Base64 string
      default: null
    },
    contentType: {
      type: String,  // เช่น image/jpeg, image/png
      default: null
    },
    fileName: {
      type: String,  // ชื่อไฟล์เดิม
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);