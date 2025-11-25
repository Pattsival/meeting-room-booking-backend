// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================
// 🔧 MIDDLEWARE
// ============================================

app.use(cors({
  origin: 'https://meeting-room-booking-frontend-eight.vercel.app/',  // ใส่ Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// ⭐ เพิ่ม limit สำหรับรองรับ Base64 รูปภาพ (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query:', req.query);
  }
  next();
});

// ============================================
// 📡 DATABASE CONNECTION
// ============================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// ============================================
// 🛣️ ROUTES
// ============================================

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Working! ✅',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ✅ Import Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');
const departmentRoutes = require('./routes/departments');
const adminRoutes = require('./routes/admin');
const adminStatsRoutes = require('./routes/adminStats');

// ✅ Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// ============================================
// ⚠️ ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    status: status
  });
});

// ============================================
// 🚀 START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 Server Started Successfully!       ║
╠═══════════════════════════════════════╣
║  Port: ${PORT}                             ║
║  Time: ${new Date().toLocaleString()}     ║
║  JSON Limit: 10MB (รองรับรูปภาพ)       ║
╚═══════════════════════════════════════╝
  `);
});

// ============================================
// 🔌 GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('🔌 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🔌 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app;