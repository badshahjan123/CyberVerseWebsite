const express = require('express');
const router = express.Router();

// Import admin sub-routes
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const activityRoutes = require('./activity');
const streaksRoutes = require('./streaks');

// Mount admin sub-routes
router.use('/auth', authRoutes);
router.use('/', usersRoutes);
router.use('/activity', activityRoutes);
router.use('/streaks', streaksRoutes);

// ── One-time migration: clear stale room progress for old rooms ──
// POST /api/admin/migrate-room-progress
// Body: { secret: "<ADMIN_SECRET>", rooms: ["networking-fundamentals", "rest-api-mastery"] }
router.post('/migrate-room-progress', async (req, res) => {
  try {
    const { secret, rooms } = req.body;

    // Simple secret guard — no auth middleware needed for one-time ops
    if (secret !== (process.env.ADMIN_MIGRATION_SECRET || 'cyberverse-migrate-2024')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const User = require('../models/User');
    const ROOMS_TO_RESET = rooms || ['networking-fundamentals', 'rest-api-mastery'];

    const users = await User.find({
      'roomProgress.roomId': { $in: ROOMS_TO_RESET }
    });

    let resetCount = 0;

    for (const user of users) {
      let modified = false;

      for (const roomId of ROOMS_TO_RESET) {
        const idx = user.roomProgress.findIndex(p => p.roomId === roomId);
        if (idx === -1) continue;

        const rp = user.roomProgress[idx];

        // Skip properly completed records
        if (rp.completed === true) continue;

        // Only reset stale records (partial progress from old buggy backend)
        const isStale =
          (rp.completedLectures && rp.completedLectures.length > 0) ||
          rp.quizCompleted === true ||
          (rp.totalPointsEarned && rp.totalPointsEarned > 0);

        if (!isStale) continue;

        // Deduct incorrectly awarded points
        const pointsToDeduct = rp.totalPointsEarned || 0;
        if (pointsToDeduct > 0) {
          user.points = Math.max(0, (user.points || 0) - pointsToDeduct);
        }

        // Reset to clean state
        user.roomProgress[idx] = {
          roomId,
          joined: false,
          currentLecture: 0,
          completedLectures: [],
          exerciseAnswers: {},
          quizCompleted: false,
          finalScore: null,
          completed: false,
          completedAt: null,
          totalPointsEarned: 0,
          totalXP: 0,
          taskScores: [],
          quizScore: { pointsEarned: 0, maxPoints: 0, percentage: 0 }
        };

        resetCount++;
        modified = true;
      }

      if (modified) {
        user.markModified('roomProgress');
        await user.save();
      }
    }

    console.log(`✅ Migration complete: reset ${resetCount} stale records across ${users.length} users`);
    res.json({
      success: true,
      message: `Migration complete`,
      resetCount,
      usersAffected: users.length
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
