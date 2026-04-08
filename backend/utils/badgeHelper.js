const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const badgeRegistry = require('./badgeRegistry');

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
                        isHidden: b.isHidden
                    } 
                },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error('Badge DB sync error:', error);
    }
};

/**
 * Utility to award a verified badge, storing it securely in the DB.
 */
const awardBadge = async (userId, badgeName) => {
    try {
        const badge = await Badge.findOne({ name: badgeName });
        if (!badge) return null;

        // Duplicate guard
        const already = await UserBadge.findOne({ user: userId, badge: badge._id });
        if (already) return null;

        await UserBadge.create({ user: userId, badge: badge._id, pointsEarned: badge.xpReward });

        // Update User object to embed the badge for fast reads
        const user = await User.findById(userId);
        if (!user) return null;

        const alreadyInArray = user.badges.some(b => b.name === badge.name);
        if (!alreadyInArray) {
            user.badges.push({
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                badgeType: badge.badgeType,
                earnedAt: new Date()
            });
            if (badge.xpReward > 0) {
                user.points = (user.points || 0) + badge.xpReward;
            }
            await user.save();
        }
        return badge;
    } catch (err) {
        if (err.code === 11000) return null; // Ignore duplicate key
        console.error('awardBadge error:', err);
        return null;
    }
};

/**
 * The core engine to evaluate all dynamic badges.
 * Called anytime user state changes (e.g., room completion, login, score change).
 * 
 * @param {ObjectId} userId 
 * @param {Object} context Contextual info like { type: 'room_completion', durationMs: 400000, ... }
 * @param {Object} io Socket.io instance for real-time broadcast
 */
const checkAndAwardBadges = async (userId, context = {}) => {
    const io = global.io || null; 
    const awardedBadges = [];

    try {
        const user = await User.findById(userId);
        if (!user) return [];

        // For rank-based badges
        if (!context.rank) {
            context.rank = await user.calculateRank();
        }

        // Ensure registry is synced to DB
        await syncBadgesDB();

        // Build a Map of already earned badge names to skip evaluating them
        const earnedNames = new Set(user.badges.map(b => b.name));

        // Evaluate all badges from registry
        for (const badgeDef of badgeRegistry) {
            if (earnedNames.has(badgeDef.name)) continue;

            const isEligible = badgeDef.evaluator(user, context);
            if (isEligible) {
                const badgeDoc = await awardBadge(userId, badgeDef.name);
                if (badgeDoc) {
                    awardedBadges.push(badgeDoc);
                    earnedNames.add(badgeDoc.name);
                }
            }
        }

        // Room-specific Primary Badges Logic (Fallback capability for legacy rooms)
        if (context.type === 'room_completion' && context.itemId) {
            const roomId = context.itemId;
            let primary = await Badge.findOne({ roomId, badgeType: 'primary' });
            
            if (!primary) {
                // Assign a generic room badge if no custom one exists
                const badgeTitle = `Room Cleared: ${roomId.replace(/-/g, ' ')}`;
                primary = await Badge.findOneAndUpdate(
                    { name: badgeTitle },
                    { $setOnInsert: {
                        name: badgeTitle, description: 'Successfully completed the room.', unlockReason: 'Complete the room',
                        category: 'room', badgeType: 'primary', roomId: roomId, difficulty: 'common', xpReward: 100, icon: 'shield-check', isHidden: false
                    } },
                    { upsert: true, new: true }
                );
            }
            if (!earnedNames.has(primary.name)) {
                const b = await awardBadge(userId, primary.name);
                if (b) awardedBadges.push(b);
            }
        }

        if (awardedBadges.length > 0 && io) {
            awardedBadges.forEach(badge => {
                io.to(`user:${userId}`).emit('badge:earned', {
                    name: badge.name,
                    description: badge.description,
                    icon: badge.icon,
                    difficulty: badge.difficulty,
                    badgeType: badge.badgeType,
                    unlockReason: badge.unlockReason,
                    xpReward: badge.xpReward,
                    isHidden: badge.isHidden
                });
            });
        }

        return awardedBadges;
    } catch (error) {
        console.error('Dynamic Badge Engine Error:', error);
        return [];
    }
};

module.exports = {
    awardBadge,
    checkAndAwardBadges,
    syncBadgesDB
};
