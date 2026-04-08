/**
 * migrate-room-progress.js
 *
 * One-time migration: clears broken roomProgress records for
 * networking-fundamentals and rest-api-mastery.
 *
 * Safe rules:
 *   - Only touches the two named rooms
 *   - Does NOT modify user.points, user.level, or any other room
 *   - Removes stale records so users start fresh with the fixed backend
 *   - Completed records (completed: true) are left untouched
 *
 * Run: node backend/scripts/migrate-room-progress.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ROOMS_TO_RESET = ['networking-fundamentals', 'rest-api-mastery'];

const isStale = (rp) => {
  // A record is stale if it was never properly completed but has partial data
  // from the old buggy backend (quizCompleted stuck true, or completedLectures
  // populated but completed:false, etc.)
  if (rp.completed === true) return false; // already completed — leave it alone
  const hasPartialData =
    (rp.completedLectures && rp.completedLectures.length > 0) ||
    rp.quizCompleted === true ||
    (rp.totalPointsEarned && rp.totalPointsEarned > 0);
  return hasPartialData;
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cyberverse_local');
    console.log('✅ Connected to MongoDB');

    const users = await User.find({
      'roomProgress.roomId': { $in: ROOMS_TO_RESET }
    });

    console.log(`📋 Found ${users.length} users with progress on target rooms`);

    let resetCount = 0;
    let removedCount = 0;

    for (const user of users) {
      let modified = false;

      for (const roomId of ROOMS_TO_RESET) {
        const idx = user.roomProgress.findIndex(p => p.roomId === roomId);
        if (idx === -1) continue;

        const rp = user.roomProgress[idx];

        if (rp.completed === true) {
          console.log(`  ⏭  Skipping completed record: user=${user.email} room=${roomId}`);
          continue;
        }

        if (isStale(rp)) {
          // Deduct any points that were incorrectly awarded from partial progress
          const pointsToDeduct = rp.totalPointsEarned || 0;
          if (pointsToDeduct > 0) {
            user.points = Math.max(0, (user.points || 0) - pointsToDeduct);
            console.log(`  💰 Deducted ${pointsToDeduct} stale points from user=${user.email}`);
          }

          // Reset to clean joined state
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

          console.log(`  🔄 Reset stale progress: user=${user.email} room=${roomId}`);
          resetCount++;
          modified = true;
        }
      }

      if (modified) {
        user.markModified('roomProgress');
        await user.save();
      }
    }

    console.log(`\n✅ Migration complete`);
    console.log(`   Reset:   ${resetCount} stale records`);
    console.log(`   Skipped: ${users.length - resetCount} clean/completed records`);

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

migrate();
