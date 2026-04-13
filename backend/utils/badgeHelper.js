const User = require("../models/User");
const Badge = require("../models/Badge");
const UserBadge = require("../models/UserBadge");
const badgeRegistry = require("./badgeRegistry");
const logger = require("./logger");

/**
 * Sync the local badgeRegistry definitions with the MongoDB Badge collection.
 * This ensures all dynamically defined badges exist in the DB.
 */
const syncBadgesDB = async () => {
  try {
    for (const b of badgeRegistry) {
      await Badge.updateOne(
        { name: b.name },
        {
          $set: {
            name: b.name,
            description: b.description,
            unlockReason: b.unlockReason,
            category: b.category,
            badgeType: b.badgeType,
            difficulty: b.difficulty,
            xpReward: b.xpReward,
            icon: b.icon,
            isHidden: b.isHidden,
          },
        },
        { upsert: true },
      );
    }
    logger.log(`✅ ${badgeRegistry.length} badges synced to database`);
  } catch (error) {
    logger.error("Badge DB sync error:", error);
  }
};

/**
 * Award a badge to a user - ensures no duplicates and updates user profile
 * @param {String|ObjectId} userId - User ID to award badge to
 * @param {String} badgeName - Name of the badge to award
 * @returns {Promise<Object>} Badge document if awarded, null if already earned or error
 */
const awardBadge = async (userId, badgeName) => {
  try {
    const badge = await Badge.findOne({ name: badgeName });
    if (!badge) {
      logger.warn(`Badge not found: ${badgeName}`);
      return null;
    }

    // Duplicate guard - check if already earned
    const existing = await UserBadge.findOne({
      user: userId,
      badge: badge._id,
    });
    if (existing) {
      logger.debug(`User already has badge: ${badgeName}`);
      return null;
    }

    // Create UserBadge record
    const userBadge = await UserBadge.create({
      user: userId,
      badge: badge._id,
      pointsEarned: badge.xpReward,
    });

    // Update User document
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return null;
    }

    // Check if badge already in user.badges array (shouldn't happen but be safe)
    const alreadyInArray = user.badges.some((b) => b.name === badge.name);
    if (!alreadyInArray) {
      user.badges.push({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date(),
      });

      // Award XP
      if (badge.xpReward > 0) {
        user.points = (user.points || 0) + badge.xpReward;
      }

      await user.save();
    }

    logger.log(`✅ Badge awarded: ${badgeName} to user ${userId}`);
    return badge;
  } catch (err) {
    if (err.code === 11000) {
      logger.debug(`Duplicate badge entry prevented: ${badgeName}`);
      return null;
    }
    logger.error("Award badge error:", err);
    return null;
  }
};

/**
 * Core badge evaluation engine
 * Evaluates all badges and awards eligible ones
 * @param {String|ObjectId} userId - User ID
 * @param {Object} context - Contextual data (type, durationMs, hintsUsed, etc.)
 * @returns {Promise<Array>} Array of awarded badges
 */
const checkAndAwardBadges = async (userId, context = {}) => {
  const io = global.io || null;
  const awardedBadges = [];

  try {
    // Fetch user with all needed data
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for badge check: ${userId}`);
      return [];
    }

    // Ensure registry is synced
    await syncBadgesDB();

    // Get already earned badges
    const earnedNames = new Set(user.badges.map((b) => b.name));

    // Prepare context with defaults
    const contextWithDefaults = {
      totalRooms: context.totalRooms || 10,
      totalLabs: context.totalLabs || 5,
      rank: context.rank || user.rank || 999,
      ...context,
    };

    // Evaluate all badges from registry
    for (const badgeDef of badgeRegistry) {
      // Skip if already earned
      if (earnedNames.has(badgeDef.name)) {
        continue;
      }

      try {
        // Evaluate eligibility
        const isEligible = badgeDef.evaluator(user, contextWithDefaults);

        if (isEligible) {
          const badgeDoc = await awardBadge(userId, badgeDef.name);
          if (badgeDoc) {
            awardedBadges.push(badgeDoc);
            earnedNames.add(badgeDoc.name);

            // Broadcast via socket if available
            if (io) {
              io.to(`user:${userId}`).emit("badge:earned", {
                name: badgeDoc.name,
                description: badgeDoc.description,
                icon: badgeDoc.icon,
                difficulty: badgeDoc.difficulty,
                category: badgeDoc.category,
                xpReward: badgeDoc.xpReward,
                isHidden: badgeDoc.isHidden,
              });
            }
          }
        }
      } catch (evalError) {
        logger.error(`Badge evaluation error for ${badgeDef.name}:`, evalError);
      }
    }

    if (awardedBadges.length > 0) {
      logger.log(`🎉 ${awardedBadges.length} badges awarded to user ${userId}`);
    }

    return awardedBadges;
  } catch (error) {
    logger.error("Badge evaluation engine error:", error);
    return [];
  }
};

/**
 * Award a room completion badge
 * Called when user completes a room
 * @param {String|ObjectId} userId - User ID
 * @param {String} roomId - Room ID/slug
 * @param {Object} completionData - Completion metrics
 */
const awardRoomBadges = async (userId, roomId, completionData = {}) => {
  try {
    const context = {
      type: "room_completion",
      itemId: roomId,
      roomId: roomId,
      durationMs: completionData.durationMs || 0,
      hintsUsed: completionData.hintsUsed || 0,
      score: completionData.score || 0,
      perfectScore: (completionData.score || 0) === 100,
      ...completionData,
    };

    return await checkAndAwardBadges(userId, context);
  } catch (error) {
    logger.error(`Error awarding room badges for ${roomId}:`, error);
    return [];
  }
};

/**
 * Award a lab completion badge
 * Called when user completes a lab
 * @param {String|ObjectId} userId - User ID
 * @param {String} labId - Lab ID
 * @param {Object} completionData - Completion metrics
 */
const awardLabBadges = async (userId, labId, completionData = {}) => {
  try {
    const context = {
      type: "lab_completion",
      itemId: labId,
      labId: labId,
      score: completionData.score || 0,
      perfectScore: (completionData.score || 0) === 100,
      ...completionData,
    };

    return await checkAndAwardBadges(userId, context);
  } catch (error) {
    logger.error(`Error awarding lab badges for ${labId}:`, error);
    return [];
  }
};

/**
 * Get all badges earned by a user
 * @param {String|ObjectId} userId - User ID
 * @returns {Promise<Array>} Array of user's badges with full badge info
 */
const getUserBadges = async (userId) => {
  try {
    const userBadges = await UserBadge.find({ user: userId })
      .populate("badge")
      .sort({ earnedAt: -1 });

    return userBadges.map((ub) => ({
      ...ub.badge.toObject(),
      earnedAt: ub.earnedAt,
      pointsEarned: ub.pointsEarned,
    }));
  } catch (error) {
    logger.error("Error fetching user badges:", error);
    return [];
  }
};

/**
 * Get badge stats for a user
 * @param {String|ObjectId} userId - User ID
 * @returns {Promise<Object>} Badge statistics
 */
const getBadgeStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    const badges = await getUserBadges(userId);

    const stats = {
      totalEarned: badges.length,
      totalAvailable: badgeRegistry.length,
      byDifficulty: {
        common: badges.filter((b) => b.difficulty === "common").length,
        uncommon: badges.filter((b) => b.difficulty === "uncommon").length,
        rare: badges.filter((b) => b.difficulty === "rare").length,
        legendary: badges.filter((b) => b.difficulty === "legendary").length,
      },
      byCategory: {
        milestone: badges.filter((b) => b.category === "milestone").length,
        skill: badges.filter((b) => b.category === "skill").length,
        streak: badges.filter((b) => b.category === "streak").length,
        special: badges.filter((b) => b.category === "special").length,
      },
      totalXPFromBadges: badges.reduce((sum, b) => sum + (b.xpReward || 0), 0),
    };

    return stats;
  } catch (error) {
    logger.error("Error calculating badge stats:", error);
    return null;
  }
};

module.exports = {
  awardBadge,
  checkAndAwardBadges,
  awardRoomBadges,
  awardLabBadges,
  getUserBadges,
  getBadgeStats,
  syncBadgesDB,
};
