// Assumes: Express.js, dockerode installed
// Lab management API routes for CyberVerse

const express = require('express');
const router = express.Router();
const { startLab, stopLab, getLabStatus, listAvailableLabs } = require('../utils/dockerManager');
const { auth } = require('../middleware/auth'); // Assuming you have auth middleware

/**
 * @route   POST /api/labs/start/:labId
 * @desc    Start a lab container
 * @access  Private (requires authentication)
 * @returns {containerId, webTerminalUrl}
 */
router.post('/start/:labId', auth, async (req, res) => {
    const { labId } = req.params;

    try {
        console.log(`🚀 User ${req.user.name} starting lab: ${labId}`);

        const result = await startLab(labId);

        res.json({
            success: true,
            message: `Lab ${labId} started successfully`,
            ...result
        });

    } catch (error) {
        console.error(`❌ Error starting lab ${labId}:`, error.message);

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to start lab',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * @route   POST /api/labs/stop/:labId
 * @desc    Stop and remove a lab container
 * @access  Private
 */
router.post('/stop/:labId', auth, async (req, res) => {
    const { labId } = req.params;

    try {
        console.log(`🛑 User ${req.user.name} stopping lab: ${labId}`);

        const result = await stopLab(labId);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error(`❌ Error stopping lab ${labId}:`, error.message);

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to stop lab'
        });
    }
});

/**
 * @route   GET /api/labs/status/:labId
 * @desc    Get lab container status
 * @access  Private
 */
router.get('/status/:labId', auth, async (req, res) => {
    const { labId } = req.params;

    try {
        const status = await getLabStatus(labId);

        res.json({
            success: true,
            labId,
            ...status
        });

    } catch (error) {
        console.error(`❌ Error getting lab status ${labId}:`, error.message);

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get lab status'
        });
    }
});

/**
 * @route   GET /api/labs/available
 * @desc    List all available labs
 * @access  Public (or Private based on your needs)
 */
router.get('/available', async (req, res) => {
    try {
        const labs = listAvailableLabs();

        res.json({
            success: true,
            labs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to list labs'
        });
    }
});

/**
 * @route   GET /api/labs/:labId/completion-status
 * @desc    Check if user has completed a specific lab
 * @access  Private
 */
router.get('/:labId/completion-status', auth, async (req, res) => {
    const { labId } = req.params;

    try {
        const User = require('../models/User');
        const Lab = require('../models/Lab');
        const mongoose = require('mongoose');

        const user = await User.findById(req.user.id);

        // Try to find lab by slug first, then by ID
        let lab;
        if (mongoose.Types.ObjectId.isValid(labId)) {
            lab = await Lab.findById(labId);
        }

        if (!lab) {
            lab = await Lab.findOne({ slug: labId });
        }

        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        // Check if user completed this lab
        const completion = lab.completedBy.find(
            entry => entry.userId && entry.userId.toString() === req.user.id
        );

        res.json({
            success: true,
            completed: !!completion,
            completionData: completion || null,
            labPoints: lab.points,
            labTitle: lab.title,
            labId: lab._id
        });

    } catch (error) {
        console.error('Error checking completion status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check completion status'
        });
    }
});

/**
 * @route   GET /api/labs
 * @desc    Get all labs from database
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const Lab = require('../models/Lab');
        const labs = await Lab.find({ isActive: true })
            .select('-content') // Exclude content to reduce payload
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // Transform data to match frontend expectations
        const formattedLabs = labs.map(lab => ({
            id: lab._id,
            slug: lab.slug,
            title: lab.title,
            description: lab.description,
            difficulty: lab.difficulty,
            category: lab.category,
            points: lab.points,
            isPremium: lab.isPremium,
            rating: 4.5, // Placeholder as rating schema wasn't visible
            participants: lab.completedBy ? lab.completedBy.length : 0,
            duration: `${lab.estimatedTime} min`,
            coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=1000", // Default image
            tags: lab.tags,
            type: 'walkthrough', // Default type
            creator: lab.createdBy ? lab.createdBy.name : 'CyberVerse'
        }));

        res.json({
            success: true,
            count: formattedLabs.length,
            data: formattedLabs
        });
    } catch (error) {
        console.error('Error fetching labs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch labs'
        });
    }
});

/**
 * @route   POST /api/labs/:labId/complete
 * @desc    Mark lab as completed and update user score
 * @access  Private
 */
router.post('/:labId/complete', auth, async (req, res) => {
    const { labId } = req.params;
    const { timeSpent, tasksCompleted, finalScore } = req.body;

    try {
        const Lab = require('../models/Lab');
        const User = require('../models/User');
        const mongoose = require('mongoose');

        // Try to find lab by slug first, then by ID
        let lab;
        if (mongoose.Types.ObjectId.isValid(labId)) {
            lab = await Lab.findById(labId);
        }

        if (!lab) {
            lab = await Lab.findOne({ slug: labId });
        }

        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already completed this lab (simplified version)
        // Check in the lab's completedBy array
        const alreadyCompleted = lab.completedBy.some(
            entry => entry.userId && entry.userId.toString() === req.user.id
        );

        if (alreadyCompleted) {
            return res.status(400).json({
                success: false,
                message: 'You have already completed this lab'
            });
        }

        // Add to user's completed count
        user.completedLabs = (user.completedLabs || 0) + 1;

        // Update user's total points
        user.points += lab.points;

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
        if (lastStreakDate) {
            lastStreakDate.setHours(0, 0, 0, 0);
        }

        // Check if user already had activity today
        const activityToday = user.streakActivities && user.streakActivities.some(activity => {
            const activityDate = new Date(activity.date);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === today.getTime();
        });

        if (!activityToday) {
            // Add today's activity
            if (!user.streakActivities) {
                user.streakActivities = [];
            }
            user.streakActivities.push({
                date: new Date(),
                activityType: 'lab',
                description: `Completed lab: ${lab.title}`
            });

            // Update streak
            if (!lastStreakDate) {
                // First activity ever
                user.currentStreak = 1;
                user.lastStreakDate = today;
            } else {
                const daysDifference = Math.floor((today - lastStreakDate) / (1000 * 60 * 60 * 24));

                if (daysDifference === 1) {
                    // Consecutive day
                    user.currentStreak += 1;
                    user.lastStreakDate = today;
                } else if (daysDifference > 1) {
                    // Streak broken, restart
                    user.currentStreak = 1;
                    user.lastStreakDate = today;
                }
                // If daysDifference === 0, already counted today (shouldn't happen due to activityToday check)
            }

            // Update longest streak
            if (user.currentStreak > user.longestStreak) {
                user.longestStreak = user.currentStreak;
            }
        }

        // Save user
        await user.save();

        // Add to lab's completedBy array
        lab.completedBy.push({
            userId: user._id,
            completedAt: new Date(),
            score: finalScore || lab.points
        });

        await lab.save();

        console.log(`✅ User ${user.name} completed lab: ${lab.title} (+${lab.points} points)`);

        // Emit real-time updates via Socket.IO (if io is available)
        const io = req.app.get('io');
        if (io) {
            // Fetch updated leaderboard
            const leaderboard = await User.find()
                .select('name email points level avatar completedLabs completedRooms')
                .sort({ points: -1 })
                .limit(50);

            // Emit leaderboard update
            io.emit('leaderboard-update', leaderboard);

            // Emit user stats update to the specific user
            io.to(req.user.id).emit('stats-update', {
                points: user.points,
                level: user.level,
                completedLabs: user.completedLabs,
                completedRooms: user.completedRooms,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak
            });

            console.log('📡 Real-time updates sent to clients');
        }

        res.json({
            success: true,
            message: `Lab completed successfully! +${lab.points} points`,
            data: {
                labId: lab._id,
                labTitle: lab.title,
                pointsEarned: lab.points,
                totalPoints: user.points,
                completedLabs: user.completedLabs,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                streakIncreased: !activityToday,
                tasksCompleted,
                timeSpent
            }
        });

    } catch (error) {
        console.error(`❌ Error completing lab ${labId}:`, error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete lab'
        });
    }
});

module.exports = router;
