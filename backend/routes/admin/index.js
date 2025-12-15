const express = require('express');
const router = express.Router();

// Import admin sub-routes
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const activityRoutes = require('./activity');
const streaksRoutes = require('./streaks');

// Mount admin sub-routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/activity', activityRoutes);
router.use('/streaks', streaksRoutes);

module.exports = router;
