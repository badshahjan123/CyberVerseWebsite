/**
 * Badge Service
 * Handles all badge-related operations including automatic assignment
 */

const User = require("../models/User");
const Room = require("../models/Room");
const Lab = require("../models/Lab");
const {
  checkAndAwardBadges,
  awardRoomBadges,
  awardLabBadges,
  getUserBadges,
  getBadgeStats,
  syncBadgesDB,
} = require("../utils/badgeHelper");
const logger = require("../utils/logger");

/**
 * Award badges for room completion
 * Called when a user completes a room
 */
async function awardBadgesOnRoomCompletion(userId, roomId, metrics = {}) {
  try {
    logger.log(`🏆 Processing badges for room completion: ${roomId}`);

    // Get room details for context
    const room = await Room.findOne({ slug: roomId });
    const user = await User.findById(userId);

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return [];
    }

    const context = {
      type: "room_completion",
      roomId,
      difficulty: room?.difficulty,
      category: room?.category,
      durationMs: metrics.durationMs || 0,
      hintsUsed: metrics.hintsUsed || 0,
      score: metrics.score || 100,
      completionTime: metrics.completionTime,
      timestampMs: Date.now(),
    };

    // Award context-specific badges
    return await awardRoomBadges(userId, roomId, context);
  } catch (error) {
    logger.error(`Error awarding room badges: ${error.message}`);
    return [];
  }
}

/**
 * Award badges for lab completion
 * Called when a user completes a lab
 */
async function awardBadgesOnLabCompletion(userId, labId, metrics = {}) {
  try {
    logger.log(`🏆 Processing badges for lab completion: ${labId}`);

    // Get lab details for context
    const lab = await Lab.findById(labId);
    const user = await User.findById(userId);

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return [];
    }

    const context = {
      type: "lab_completion",
      labId,
      difficulty: lab?.difficulty,
      category: lab?.category,
      score: metrics.score || 100,
      timestampMs: Date.now(),
    };

    // Award context-specific badges
    return await awardLabBadges(userId, labId, context);
  } catch (error) {
    logger.error(`Error awarding lab badges: ${error.message}`);
    return [];
  }
}

/**
 * Check and award badges on user login
 * Useful for streak badges and other periodic badges
 */
async function awardBadgesOnLogin(userId) {
  try {
    logger.log(`📍 Checking badges on login for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return [];
    }

    const context = {
      type: "user_login",
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalChallenges: (user.completedRooms || 0) + (user.completedLabs || 0),
      timestampMs: Date.now(),
    };

    return await checkAndAwardBadges(userId, context);
  } catch (error) {
    logger.error(`Error awarding login badges: ${error.message}`);
    return [];
  }
}

/**
 * Check and award badges when user streak is updated
 */
async function awardBadgesOnStreakUpdate(userId, newStreak) {
  try {
    logger.log(
      `🔥 Checking streak badges for user: ${userId}, streak: ${newStreak}`,
    );

    const context = {
      type: "streak_update",
      currentStreak: newStreak,
      timestampMs: Date.now(),
    };

    return await checkAndAwardBadges(userId, context);
  } catch (error) {
    logger.error(`Error awarding streak badges: ${error.message}`);
    return [];
  }
}

/**
 * Check and award badges when user skill level is updated
 */
async function awardBadgesOnSkillUpdate(userId, skillName, newValue) {
  try {
    logger.log(`💡 Checking skill badges for ${skillName}: ${newValue}`);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return [];
    }

    const context = {
      type: "skill_update",
      skill: skillName,
      value: newValue,
      skills: user.skills,
      timestampMs: Date.now(),
    };

    return await checkAndAwardBadges(userId, context);
  } catch (error) {
    logger.error(`Error awarding skill badges: ${error.message}`);
    return [];
  }
}

/**
 * Check all badges for a user (used for periodic checks or admin functions)
 */
async function checkAllBadges(userId) {
  try {
    logger.log(`🔍 Running complete badge check for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return [];
    }

    // Fetch current rank
    const userWithRank = await User.findById(userId).sort({
      points: -1,
      completedRooms: -1,
      completedLabs: -1,
    });

    const allUsers = await User.find().sort({ points: -1 });
    const userRank =
      allUsers.findIndex((u) => u._id.toString() === userId.toString()) + 1;

    const context = {
      type: "manual_check",
      rank: userRank,
      totalRooms: 10,
      totalLabs: 5,
      timestampMs: Date.now(),
    };

    return await checkAndAwardBadges(userId, context);
  } catch (error) {
    logger.error(`Error in complete badge check: ${error.message}`);
    return [];
  }
}

/**
 * Get formatted user badges with stats
 */
async function getUserBadgesWithStats(userId) {
  try {
    const badges = await getUserBadges(userId);
    const stats = await getBadgeStats(userId);

    return {
      badges: badges.sort(
        (a, b) => new Date(b.earnedAt) - new Date(a.earnedAt),
      ),
      stats,
      success: true,
    };
  } catch (error) {
    logger.error(`Error fetching user badges: ${error.message}`);
    return {
      badges: [],
      stats: null,
      success: false,
    };
  }
}

/**
 * Initialize badge system (sync DB on app start)
 */
async function initializeBadgeSystem() {
  try {
    logger.log("🎖️  Initializing badge system...");
    await syncBadgesDB();
    logger.log("✅ Badge system initialized");
    return true;
  } catch (error) {
    logger.error("Badge system initialization failed:", error);
    return false;
  }
}

/**
 * Get badge statistics for leaderboard context
 */
async function getBadgeLeaderboard(limit = 10) {
  try {
    const users = await User.find()
      .select("name badges points level -password")
      .sort({ badges: -1, points: -1 })
      .limit(limit);

    return users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      badgeCount: (user.badges || []).length,
      points: user.points,
      level: user.level,
    }));
  } catch (error) {
    logger.error(`Error fetching badge leaderboard: ${error.message}`);
    return [];
  }
}

module.exports = {
  awardBadgesOnRoomCompletion,
  awardBadgesOnLabCompletion,
  awardBadgesOnLogin,
  awardBadgesOnStreakUpdate,
  awardBadgesOnSkillUpdate,
  checkAllBadges,
  getUserBadgesWithStats,
  initializeBadgeSystem,
  getBadgeLeaderboard,
};
