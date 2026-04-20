const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieAuth = async (req, res, next) => {
  try {
    let token = req.cookies.adminToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // Check for token in cookie OR Authorization header
    let token = req.cookies.adminToken;

    if (!token && req.headers.authorization) {
      // Extract token from "Bearer <token>"
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('❌ No token found in cookie or Authorization header');
      return res.status(401).json({ message: 'Access denied. Admin token required.' });
    }

    console.log('🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.userId, role: decoded.role });

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(403).json({ message: 'Access denied. User not found.' });
    }

    console.log('👤 User found:', { id: user._id, role: user.role, email: user.email });

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      console.log('❌ User role not authorized:', user.role);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    console.log('✅ Admin auth successful');
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error.message);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { cookieAuth, adminAuth };