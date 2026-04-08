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
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
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
    weeklyStats = await this.create({
      userId,
      weekStartDate: startOfWeek,
      weekEndDate: endOfWeek,
      startRank: 0,
      currentRank: 0
    });
  }

  return weeklyStats;
};

// Update stats for an activity
weeklyStatsSchema.statics.recordActivity = async function(userId, activityType, points, isNewCompletion = true) {
  const stats = await this.getCurrentWeekStats(userId);
  
  if (points) {
    stats.pointsEarned += points;
  }
  
  if (isNewCompletion) {
    if (activityType === 'room') {
      stats.roomsCompleted += 1;
    } else if (activityType === 'lab') {
      stats.labsCompleted += 1;
    }
  }
  
  // Update rank if necessary (can be called separately if rank calculation is expensive)
  // For now, we just save the points
  await stats.save();
  return stats;
};

module.exports = mongoose.model('WeeklyStats', weeklyStatsSchema);