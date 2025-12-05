const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Lab = require('../models/Lab');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/admin/recalculate-streaks
 * @desc    Recalculate streaks for all users based on completion history
 * @access  Admin only
 */
router.post('/recalculate-streaks', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const users = await User.find();
        let updatedCount = 0;

        for (const user of users) {
            // Collect all completion activities with dates
            const activities = [];

            // Add room completions
            if (user.roomProgress && user.roomProgress.length > 0) {
                for (const progress of user.roomProgress) {
                    if (progress.completed && progress.completedAt) {
                        activities.push({
                            date: new Date(progress.completedAt),
                            type: 'room',
                            id: progress.roomId
                        });
                    }
                }
            }

            // Add lab completions
            const completedLabs = await Lab.find({
                'completedBy.userId': user._id
            }).select('title completedBy');

            for (const lab of completedLabs) {
                const completion = lab.completedBy.find(c => c.userId.toString() === user._id.toString());
                if (completion && completion.completedAt) {
                    activities.push({
                        date: new Date(completion.completedAt),
                        type: 'lab',
                        id: lab._id,
                        title: lab.title
                    });
                }
            }

            if (activities.length === 0) {
                continue;
            }

            // Sort activities by date
            activities.sort((a, b) => a.date - b.date);

            // Group by date
            const activityDates = new Map();
            for (const activity of activities) {
                const dateKey = activity.date.toISOString().split('T')[0];
                if (!activityDates.has(dateKey)) {
                    activityDates.set(dateKey, []);
                }
                activityDates.get(dateKey).push(activity);
            }

            const uniqueDates = Array.from(activityDates.keys()).sort();

            let currentStreak = 0;
            let longestStreak = 0;
            let lastDate = null;

            for (const dateStr of uniqueDates) {
                const currentDate = new Date(dateStr);

                if (!lastDate) {
                    currentStreak = 1;
                } else {
                    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

                    if (daysDiff === 1) {
                        currentStreak++;
                    } else {
                        currentStreak = 1;
                    }
                }

                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }

                lastDate = currentDate;
            }

            // Check if streak is still active
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastActivityDate = new Date(uniqueDates[uniqueDates.length - 1]);
            const daysSinceLastActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

            let finalCurrentStreak = currentStreak;
            if (daysSinceLastActivity > 1) {
                finalCurrentStreak = 0;
            }

            // Update user
            user.currentStreak = finalCurrentStreak;
            user.longestStreak = longestStreak;
            user.lastStreakDate = lastActivityDate;

            user.streakActivities = activities.map(a => ({
                date: a.date,
                activityType: a.type,
                description: a.type === 'room'
                    ? `Completed room: ${a.id}`
                    : `Completed lab: ${a.title || a.id}`
            }));

            await user.save();
            updatedCount++;

            console.log(`✅ Updated ${user.name}: current=${finalCurrentStreak}, longest=${longestStreak}`);
        }

        res.json({
            success: true,
            message: `Streaks recalculated for ${updatedCount} users`,
            data: {
                totalUsers: users.length,
                updatedUsers: updatedCount
            }
        });

    } catch (error) {
        console.error('Error recalculating streaks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate streaks',
            error: error.message
        });
    }
});

module.exports = router;
