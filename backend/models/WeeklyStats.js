const mongoose = require('mongoose');

const weeklyStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  labsCompleted: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  startRank: {
    type: Number,
    default: 0
  },
  currentRank: {
    type: Number,
    default: 0
  },
  roomsCompleted: {
    type: Number,
    default: 0
  }
});

// Get or create weekly stats for a user
weeklyStatsSchema.statics.getCurrentWeekStats = async function(userId) {
  const now = new Date();
  
  // Calculate this week's boundaries
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let weeklyStats = await this.findOne({
    userId,
    weekStartDate: { $lte: now },
    weekEndDate: { $gte: now }
  });

  if (!weeklyStats) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    // Default initial rank logic
    const totalUsers = await User.countDocuments();
    const currentRealRank = user ? await user.calculateRank() : totalUsers;
    
    // If they joined THIS WEEK, startRank is the bottom (totalUsers)
    // and pointsEarned starts with their signup bonus.
    const isNewUserThisWeek = user && user.createdAt >= startOfWeek;
    
    weeklyStats = await this.create({
      userId,
      weekStartDate: startOfWeek,
      weekEndDate: endOfWeek,
      pointsEarned: isNewUserThisWeek ? user.points : 0,
      startRank: isNewUserThisWeek ? totalUsers : currentRealRank,
      currentRank: currentRealRank
    });
  }

  return weeklyStats;
};

// Update stats for an activity
weeklyStatsSchema.statics.recordActivity = async function(userId, activityType, points, isNewCompletion = false) {
  const stats = await this.getCurrentWeekStats(userId);

  if (points && points > 0) {
    stats.pointsEarned += points;
  }

  if (isNewCompletion) {
    if (activityType === 'room') stats.roomsCompleted += 1;
    else if (activityType === 'lab') stats.labsCompleted += 1;
  }

  // Ensure current rank is always live
  try {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (user) {
      stats.currentRank = await user.calculateRank();
      
      // If user has more total points than weekly (e.g. joined before this week)
      // we DON'T cap. But if somehow weekly exceeds total (shouldn't happen), we cap.
      if (stats.pointsEarned > user.points) {
        stats.pointsEarned = user.points;
      }
    }
  } catch (_) {}

  await stats.save();
  return stats;
};

module.exports = mongoose.model('WeeklyStats', weeklyStatsSchema);