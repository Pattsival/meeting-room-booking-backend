const jwt = require('jsonwebtoken');

// ตรวจสอบ Token ว่าถูกต้องหรือไม่
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }
    
    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ตรวจสอบ Admin เท่านั้น
const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };