const express = require('express');
const Booking = require('../models/Booking');
const MeetingRoom = require('../models/MeetingRoom');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 📊 กราฟแนวโน้มการจอง (7 วันล่าสุด)
router.get('/bookings-trend', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // จัดกลุ่มตามวัน
    const trendData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendData[dateStr] = { date: dateStr, total: 0, approved: 0, pending: 0, rejected: 0 };
    }

    bookings.forEach(booking => {
      const dateStr = booking.createdAt.toISOString().split('T')[0];
      if (trendData[dateStr]) {
        trendData[dateStr].total++;
        if (booking.status === 'approved') trendData[dateStr].approved++;
        if (booking.status === 'pending') trendData[dateStr].pending++;
        if (booking.status === 'rejected') trendData[dateStr].rejected++;
      }
    });

    const result = Object.values(trendData).reverse();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🏨 ห้องที่ถูกจองมากที่สุด
router.get('/popular-rooms', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const rooms = await MeetingRoom.find();
    
    const roomStats = await Promise.all(
      rooms.map(async (room) => {
        const total = await Booking.countDocuments({ roomId: room._id });
        const approved = await Booking.countDocuments({ roomId: room._id, status: 'approved' });
        
        return {
          name: `${room.roomNumber} - ${room.roomName}`,
          total,
          approved,
          capacity: room.capacity
        };
      })
    );

    // เรียงจากมากไปน้อย
    roomStats.sort((a, b) => b.total - a.total);

    res.json(roomStats.slice(0, 10)); // Top 10
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🏢 Department ที่จองมากที่สุด
router.get('/department-usage', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find();

    const deptStats = {};
    bookings.forEach(booking => {
      const dept = booking.department;
      if (!deptStats[dept]) {
        deptStats[dept] = { name: dept, total: 0, approved: 0, pending: 0 };
      }
      deptStats[dept].total++;
      if (booking.status === 'approved') deptStats[dept].approved++;
      if (booking.status === 'pending') deptStats[dept].pending++;
    });

    const result = Object.values(deptStats).sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📈 สถิติรายเดือน
router.get('/monthly-stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const months = 6; // 6 เดือนล่าสุด
    const monthlyData = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const total = await Booking.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const approved = await Booking.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'approved'
      });

      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        total,
        approved
      });
    }

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;