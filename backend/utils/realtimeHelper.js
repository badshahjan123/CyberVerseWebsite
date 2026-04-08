/**
 * RealtimeHelper handles centralized Socket.io broadcasts for user progress updates.
 * This ensures that when a user completes an action, all relevant data is synced
 * across the platform instantly.
 */

const User = require('../models/User');

const RealtimeHelper = {
  /**
   * Broadcasts updated stats to a specific user and global leaderboard updates.
   * @param {string} userId - The user ID to update.
   * @param {Object} io - Socket.io instance.
   */
  broadcastUserUpdate: async (userId, io) => {
    if (!io) return;

    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Re-verify completion counts if they seem stale
      const actualRooms = user.roomProgress ? user.roomProgress.filter(p => p.completed).length : 0;
      const actualLabs = user.labProgress ? user.labProgress.filter(p => p.completed).length : 0;
      
      if (user.completedRooms !== actualRooms || user.completedLabs !== actualLabs) {
        user.completedRooms = actualRooms;
        user.completedLabs = actualLabs;
        await user.save();
      }

      const rank = await user.calculateRank();
      
      // 1. Send detailed private update to the specific user
      const userStats = {
        points: user.points,
        xp: user.xp,
        level: user.level,
        rank: rank,
        completedLabs: user.completedLabs,
        completedRooms: user.completedRooms,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        isPremium: user.isPremium,
        skills: user.skills,
        pointsToNextLevel: user.getPointsToNextLevel()
      };

      io.to(`user:${userId}`).emit('user:stats:update', userStats);

      // 2. Broadcast leaderboard update globally if rank might have changed
      // We limit to top 50 for performance
      const leaderboard = await User.find({ isActive: true })
        .select('name points level completedLabs completedRooms avatar badges xp skills')
        .sort({ points: -1, completedLabs: -1, completedRooms: -1 })
        .limit(50);

      const leaderboardWithRank = leaderboard.map((u, index) => ({
        ...u.toObject(),
        rank: index + 1,
        username: u.name // consistency with frontend
      }));

      io.emit('leaderboard:update', leaderboardWithRank);
      
      console.log(`[Realtime] Sync complete for user ${userId} (${user.name})`);
    } catch (error) {
      console.error('[Realtime] Sync failure:', error);
    }
  }
};

module.exports = RealtimeHelper;
