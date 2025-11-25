// ============================================
// 📊 DATABASE SCHEMA & SEEDS
// ============================================
// สร้างไฟล์นี้เป็น: scripts/seedDB.js
// รัน: node scripts/seedDB.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ============================================
// 1️⃣ IMPORT MODELS
// ============================================

const User = require('../models/User');
const Department = require('../models/Department');
const MeetingRoom = require('../models/MeetingRoom');
const Booking = require('../models/Booking');

// ============================================
// 2️⃣ CONNECT DATABASE
// ============================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
};

// ============================================
// 3️⃣ SEED DATA
// ============================================

const seedDatabase = async () => {
  try {
    // ✅ Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await MeetingRoom.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Data cleared');

    // ============================================
    // 📋 SEED DEPARTMENTS
    // ============================================

    console.log('\n📋 Seeding Departments...');

    const departmentsData = [
      { name: 'สำนักปลัดเทศบาล', code: 'MAYOR' },
      { name: 'สำนักช่าง', code: 'ENGINEERING' },
      { name: 'สำนักคลัง', code: 'FINANCE' },
      { name: 'สำนักสาธารณสุขฯ', code: 'HEALTH' },
      { name: 'สำนักการศึกษา', code: 'EDUCATION' },
      { name: 'สำนักการประปา', code: 'WATER' },
      { name: 'กองยุทธศาสตร์ฯ', code: 'STRATEGY' },
      { name: 'กองสวัสดิการสังคม', code: 'SOCIAL' },
      { name: 'กองสารสนเทศภาษีฯ', code: 'IT_TAX' },
      { name: 'กองการเจ้าหน้าที่', code: 'HR' },
      { name: 'หน่วยตรวจสอบภายใน', code: 'AUDIT' }
    ];

    const departments = await Department.insertMany(departmentsData);
    console.log(`✅ ${departments.length} departments created`);

    // ============================================
    // 👥 SEED USERS
    // ============================================

    console.log('\n👥 Seeding Users...');

    const adminUser = new User({
      fullName: 'ผู้บริหารระบบ',
      email: 'admin@meeting.com',
      password: await bcrypt.hash('admin123', 10),
      department: 'สำนักปลัดเทศบาล',
      role: 'admin'
    });

    const regularUsers = [
      {
        fullName: 'สมชาย ใจดี',
        email: 'somchai@mail.com',
        password: await bcrypt.hash('123456', 10),
        department: 'สำนักปลัดเทศบาล',
        role: 'user'
      },
      {
        fullName: 'สมหวัง งามวงศ์',
        email: 'somwang@mail.com',
        password: await bcrypt.hash('123456', 10),
        department: 'สำนักช่าง',
        role: 'user'
      },
      {
        fullName: 'จิตรา สวยงาม',
        email: 'chitra@mail.com',
        password: await bcrypt.hash('123456', 10),
        department: 'สำนักคลัง',
        role: 'user'
      },
      {
        fullName: 'สันติ ศรีสวัสดิ์',
        email: 'santi@mail.com',
        password: await bcrypt.hash('123456', 10),
        department: 'สำนักสาธารณสุขฯ',
        role: 'user'
      },
      {
        fullName: 'พรรณ ใจโปร่ง',
        email: 'pan@mail.com',
        password: await bcrypt.hash('123456', 10),
        department: 'สำนักการศึกษา',
        role: 'user'
      }
    ];

    const users = await User.create([adminUser, ...regularUsers]);
    console.log(`✅ ${users.length} users created`);

    // ============================================
    // 🏨 SEED MEETING ROOMS
    // ============================================

    console.log('\n🏨 Seeding Meeting Rooms...');

    const roomsData = [
      {
        roomNumber: '101',
        roomName: 'ห้องประชุม A',
        capacity: 10,
        facilities: ['Projector', 'Whiteboard', 'Air Conditioner']
      },
      {
        roomNumber: '102',
        roomName: 'ห้องประชุม B',
        capacity: 15,
        facilities: ['Projector', 'Screen', 'Whiteboard', 'Air Conditioner', 'Video Conference']
      },
      {
        roomNumber: '103',
        roomName: 'ห้องประชุม C',
        capacity: 20,
        facilities: ['Projector', 'Screen', 'Whiteboard', 'Air Conditioner', 'Sound System']
      },
      {
        roomNumber: '104',
        roomName: 'ห้องประชุม D',
        capacity: 8,
        facilities: ['Whiteboard', 'Air Conditioner', 'Round Table']
      },
      {
        roomNumber: '105',
        roomName: 'ห้องประชุม E',
        capacity: 25,
        facilities: ['Projector', 'Screen', 'Whiteboard', 'Air Conditioner', 'Video Conference', 'Sound System']
      }
    ];

    const rooms = await MeetingRoom.insertMany(roomsData);
    console.log(`✅ ${rooms.length} meeting rooms created`);

    // ============================================
    // 🎫 SEED BOOKINGS
    // ============================================

    console.log('\n🎫 Seeding Bookings...');

    // ✓ สร้างวันที่ตัวอย่าง
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const bookingsData = [
      {
        userId: users[0]._id, // admin
        roomId: rooms[0]._id, // ห้อง 101
        fullName: 'ผู้บริหารระบบ',
        department: 'สำนักปลัดเทศบาล',
        bookingDate: today,
        startTime: '09:00',
        endTime: '10:30',
        purpose: 'ประชุมวางแผนประจำวัน',
        status: 'approved'
      },
      {
        userId: users[1]._id, // somchai
        roomId: rooms[1]._id, // ห้อง 102
        fullName: 'สมชาย ใจดี',
        department: 'สำนักปลัดเทศบาล',
        bookingDate: today,
        startTime: '11:00',
        endTime: '12:00',
        purpose: 'ประชุมด้านการเงิน',
        status: 'approved'
      },
      {
        userId: users[2]._id, // somwang
        roomId: rooms[2]._id, // ห้อง 103
        fullName: 'สมหวัง งามวงศ์',
        department: 'สำนักช่าง',
        bookingDate: today,
        startTime: '14:00',
        endTime: '15:30',
        purpose: 'ประชุมโครงการก่อสร้าง',
        status: 'pending'
      },
      {
        userId: users[3]._id, // chitra
        roomId: rooms[3]._id, // ห้อง 104
        fullName: 'จิตรา สวยงาม',
        department: 'สำนักคลัง',
        bookingDate: tomorrow,
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'ประชุมงบประมาณประจำปี',
        status: 'approved'
      },
      {
        userId: users[4]._id, // santi
        roomId: rooms[4]._id, // ห้อง 105
        fullName: 'สันติ ศรีสวัสดิ์',
        department: 'สำนักสาธารณสุขฯ',
        bookingDate: tomorrow,
        startTime: '13:00',
        endTime: '15:00',
        purpose: 'ประชุมโครงการสุขภาพ',
        status: 'pending'
      },
      {
        userId: users[1]._id, // somchai
        roomId: rooms[0]._id, // ห้อง 101
        fullName: 'สมชาย ใจดี',
        department: 'สำนักปลัดเทศบาล',
        bookingDate: dayAfter,
        startTime: '10:00',
        endTime: '11:30',
        purpose: 'ประชุมติดตามงาน',
        status: 'approved'
      },
      {
        userId: users[2]._id, // somwang
        roomId: rooms[1]._id, // ห้อง 102
        fullName: 'สมหวัง งามวงศ์',
        department: 'สำนักช่าง',
        bookingDate: dayAfter,
        startTime: '14:00',
        endTime: '16:00',
        purpose: 'ประชุมออกแบบโครงการ',
        status: 'approved'
      }
    ];

    const bookings = await Booking.insertMany(bookingsData);
    console.log(`✅ ${bookings.length} bookings created`);

    // ============================================
    // ✅ SUCCESS
    // ============================================

    console.log(`
╔════════════════════════════════════════╗
║  ✅ Database Seeded Successfully!      ║
╠════════════════════════════════════════╣
║  Users: ${users.length}                              ║
║  Departments: ${departments.length}                        ║
║  Rooms: ${rooms.length}                              ║
║  Bookings: ${bookings.length}                             ║
╚════════════════════════════════════════╝

📝 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍💼 ADMIN:
  Email: admin@meeting.com
  Password: admin123

👤 USERS:
  Email: somchai@mail.com | Password: 123456
  Email: somwang@mail.com | Password: 123456
  Email: chitra@mail.com | Password: 123456
  Email: santi@mail.com | Password: 123456
  Email: pan@mail.com | Password: 123456
    `);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// ============================================
// 🚀 RUN SEED
// ============================================

connectDB().then(() => seedDatabase());