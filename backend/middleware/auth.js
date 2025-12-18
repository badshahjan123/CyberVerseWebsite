const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    // Check if user is blocked/inactive
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support for assistance.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      req.user = user;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, optionalAuth };