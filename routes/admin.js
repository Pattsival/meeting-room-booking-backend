// routes/admin.js
const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const MeetingRoom = require('../models/MeetingRoom');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 👨‍💼 ดูทุกคน
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      total: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 ดูสถิติทั่วไป
router.get('/dashboard/statistics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRooms = await MeetingRoom.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });

    res.json({
      users: {
        total: totalUsers,
        admins: await User.countDocuments({ role: 'admin' }),
        regularUsers: await User.countDocuments({ role: 'user' })
      },
      rooms: {
        total: totalRooms
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        rejected: rejectedBookings
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📋 ดูการจองทั้งหมด (Admin View)
router.get('/bookings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'fullName email department')
      .populate('roomId', 'roomNumber roomName capacity')
      .sort({ bookingDate: -1 });

    res.json({
      total: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✏️ อนุมัติ/ปฏิเสธการจอง
router.put('/bookings/:bookingId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('roomId').populate('userId', 'fullName email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ ลบการจอง (Admin only) - ⭐ เพิ่มส่วนนี้
router.delete('/bookings/:bookingId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.json({ 
      message: 'Booking deleted successfully by admin',
      deletedId: bookingId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;