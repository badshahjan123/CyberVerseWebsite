const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/streak
// @desc    Get user's current streak
// @access  Private
router.get('/streak', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check and update streak status (handles automatic reset if broken)
        user.checkStreakStatus();
        await user.save();

        res.json({
            currentStreak: user.currentStreak || 0,
            longestStreak: user.longestStreak || 0,
            lastStreakDate: user.lastStreakDate
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/user/update-streak
// @desc    Update user streak (called when user completes activity)
// @access  Private
router.post('/update-streak', auth, async (req, res) => {
    try {
        const { activityType, itemId } = req.body; // 'room' or 'lab'

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use the proper updateStreak method which handles all the logic
        user.updateStreak(activityType || 'room', itemId);
        await user.save();

        res.json({
            currentStreak: user.currentStreak || 0,
            longestStreak: user.longestStreak || 0,
            message: 'Streak updated'
        });
    } catch (error) {
        console.error('Update streak error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/user/badges
// @desc    Get user's badges
// @access  Private
router.get('/badges', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ badges: user.badges || [] });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/user/saved-items
// @desc    Get user's saved items
// @access  Private
router.get('/saved-items', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedItems.itemId',
            select: 'title description difficulty category slug'
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ savedItems: user.savedItems || [] });
    } catch (error) {
        console.error('Get saved items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/user/save-item/:type/:id
// @desc    Toggle save/unsave an item
// @access  Private
router.post('/save-item/:type/:id', auth, async (req, res) => {
    try {
        const { type, id } = req.params;

        if (!['room', 'lab'].includes(type)) {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if item is already saved
        const existingIndex = user.savedItems.findIndex(
            item => item.itemId.toString() === id && item.itemType === type
        );

        if (existingIndex !== -1) {
            // Remove from saved
            user.savedItems.splice(existingIndex, 1);
            await user.save();
            return res.json({ message: 'Item removed from saved', saved: false });
        } else {
            // Add to saved
            user.savedItems.push({
                itemType: type,
                itemId: id,
                savedAt: new Date()
            });
            await user.save();
            return res.json({ message: 'Item saved', saved: true });
        }
    } catch (error) {
        console.error('Toggle save item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/user/certificates
// @desc    Get user's certificates
// @access  Private
router.get('/certificates', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get all completed rooms with their details
        const completedRoomIds = user.roomProgress
            ?.filter(rp => rp.completed && rp.roomId)
            .map(rp => {
                // Convert string roomId to ObjectId
                try {
                    return require('mongoose').Types.ObjectId(rp.roomId);
                } catch (err) {
                    console.error('Invalid roomId:', rp.roomId);
                    return null;
                }
            })
            .filter(id => id !== null) || [];

        // If no completed rooms, return empty array
        if (completedRoomIds.length === 0) {
            return res.json({ certificates: [] });
        }

        const completedRooms = await Room.find({ _id: { $in: completedRoomIds } });

        // Generate certificates for completed rooms
        const certificates = completedRooms.map(room => {
            const progress = user.roomProgress.find(rp => rp.roomId.toString() === room._id.toString());
            const completionScore = progress?.finalScore || progress?.score || 100;

            return {
                _id: room._id,
                title: room.name,
                category: room.category || 'Cybersecurity',
                type: 'room', // You can add 'path' type later for learning paths
                credentialId: `UC-${(room.category?.substring(0, 3) || 'CYB').toUpperCase()}-${room._id.toString().substring(0, 8).toUpperCase()}`,
                issueDate: progress?.completedAt || new Date(),
                earnedDate: progress?.completedAt || new Date(),
                expiryDate: null,
                verificationUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${room._id}`,
                score: completionScore,
                completionScore: completionScore,
                earned: true,
                completed: true,
                requirement: `Complete ${room.name}`
            };
        });

        res.json({ certificates });
    } catch (error) {
        console.error('Get certificates error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
