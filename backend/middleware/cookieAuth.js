const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;
    
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
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Admin token required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { cookieAuth, adminAuth };