const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Manual streak fix endpoint
router.post('/fix-my-streak', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has any completed rooms
        const completedRooms = user.roomProgress?.filter(rp => rp.completed && rp.completedAt) || [];
        const completedLabs = user.labProgress?.filter(lp => lp.completed && lp.completedAt) || [];

        console.log('Completed rooms:', completedRooms.length);
        console.log('Completed labs:', completedLabs.length);

        if (completedRooms.length === 0 && completedLabs.length === 0) {
            return res.status(400).json({
                message: 'No completed activities found. Complete a room or lab first.'
            });
        }

        // Get all completion dates
        const allCompletions = [
            ...completedRooms.map(r => ({ date: r.completedAt, type: 'room', id: r.roomId })),
            ...completedLabs.map(l => ({ date: l.completedAt, type: 'lab', id: l.labId }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('All completions:', allCompletions);

        // Rebuild streak from scratch
        user.currentStreak = 0;
        user.longestStreak = 0;
        user.lastStreakDate = null;
        user.streakActivities = [];

        let tempStreak = 0;
        let lastDate = null;

        for (const completion of allCompletions) {
            const completionDate = new Date(completion.date);
            completionDate.setHours(0, 0, 0, 0);

            // Check if already counted this date
            const alreadyCounted = user.streakActivities.some(activity => {
                const actDate = new Date(activity.date);
                actDate.setHours(0, 0, 0, 0);
                return actDate.getTime() === completionDate.getTime();
            });

            if (alreadyCounted) {
                continue; // Skip duplicates for same day
            }

            // Add to activities
            user.streakActivities.push({
                date: completionDate,
                activityType: completion.type,
                itemId: completion.id
            });

            if (!lastDate) {
                // First activity
                tempStreak = 1;
                lastDate = completionDate;
            } else {
                const yesterday = new Date(completionDate);
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastDate.getTime() === yesterday.getTime()) {
                    // Consecutive day
                    tempStreak++;
                } else if (lastDate.getTime() === completionDate.getTime()) {
                    // Same day, already handled above
                } else {
                    // Streak broken, start new
                    tempStreak = 1;
                }
                lastDate = completionDate;
            }

            // Update longest streak
            if (tempStreak > user.longestStreak) {
                user.longestStreak = tempStreak;
            }
        }

        // Set current streak based on last activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate) {
            if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
                user.currentStreak = tempStreak;
                user.lastStreakDate = lastDate;
            } else {
                // Streak broken (more than 1 day ago)
                user.currentStreak = 0;
                user.lastStreakDate = lastDate;
            }
        }

        await user.save();

        console.log('✅ Streak fixed!', {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            activities: user.streakActivities.length
        });

        res.json({
            message: 'Streak recalculated successfully!',
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalActivities: user.streakActivities.length,
            lastStreakDate: user.lastStreakDate
        });

    } catch (error) {
        console.error('Fix streak error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
