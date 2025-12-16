const express = require('express');
const router = express.Router();

// Import admin sub-routes
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const activityRoutes = require('./activity');
const streaksRoutes = require('./streaks');

// Mount admin sub-routes
router.use('/auth', authRoutes);
router.use('/', usersRoutes); // Mount at root so /dashboard/stats, /users, /rooms, /labs all work
router.use('/activity', activityRoutes);
router.use('/streaks', streaksRoutes);

module.exports = router;
