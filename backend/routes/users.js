const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Import new middleware utilities
const asyncHandler = require('../middleware/asyncHandler');
const { attachUser } = require('../middleware/userMiddleware');
const { ApiError } = require('../middleware/errorHandler');
const { HTTP_STATUS, MESSAGES } = require('../config/constants');
const BadgeHelper = require('../utils/badgeHelper');
const RealtimeHelper = require('../utils/realtimeHelper');
const Lab = require('../models/Lab');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});


router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, type = 'global', page = 1 } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    let dateFilter = {};
    if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { updatedAt: { $gte: weekAgo } };
    } else if (type === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { updatedAt: { $gte: monthAgo } };
    }

    const users = await User.find(dateFilter)
      .select('name points level completedLabs completedRooms isPremium badges')
      .sort({ points: -1, completedRooms: -1, completedLabs: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,  // Adjust rank based on page
      username: user.name,
      points: user.points,
      level: user.level,
      completedLabs: user.completedLabs,
      completedRooms: user.completedRooms,
      isPremium: user.isPremium,
      pointsToNextLevel: user.getPointsToNextLevel ? user.getPointsToNextLevel() : 1000 - (user.points % 1000)
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/upload-avatar', auth, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    try {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Use the uploaded file directly (multer already saved it)
      const filename = req.file.filename || `avatar-${user._id}-${Date.now()}.jpg`;
      const avatarPath = `/uploads/avatars/${filename}`;

      // Delete old avatar if exists
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        try {
          const oldPath = path.join(__dirname, '..', user.avatar);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (deleteError) {
          console.log('Could not delete old avatar:', deleteError.message);
        }
      }

      // Update user
      user.avatar = avatarPath;
      await user.save();

      res.json({
        message: 'Avatar updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isPremium: user.isPremium,
          level: user.level,
          points: user.points,
          completedLabs: user.completedLabs,
          completedRooms: user.completedRooms
        }
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  });
});


router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, avatar } = req.body;
    const updateData = {};

    if (name && name.trim()) updateData.name = name.trim();
    if (email && email.trim()) {
      // Check if email is already taken by another user (case-sensitive)
      const existingUser = await User.findOne({
        email: email.trim(),
        _id: { $ne: req.user._id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = email.trim();
    }
    if (avatar) updateData.avatar = avatar;

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: false } // Skip mongoose validation since we already validated
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        level: user.level,
        points: user.points,
        completedLabs: user.completedLabs,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const WeeklyStats = require('../models/WeeklyStats');
    const weekly = await WeeklyStats.getCurrentWeekStats(user._id);

    const rank = await user.calculateRank();
    const level = user.calculateLevel();
    const pointsToNextLevel = user.getPointsToNextLevel();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        points: user.points,
        level,
        rank,
        pointsToNextLevel,
        completedRooms: user.completedRooms,
        completedLabs: user.completedLabs,
        isPremium: user.isPremium,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      },
      weeklyStats: {
        labsCompleted: weekly.labsCompleted || 0,
        roomsCompleted: weekly.roomsCompleted || 0,
        pointsEarned: weekly.pointsEarned || 0,
        timeSpent: `${Math.round(weekly.timeSpent / 60)}h`,
        rankChange: (weekly.startRank || rank) - rank
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/reset-streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.currentStreak = 0;
    user.lastStreakDate = null;
    user.streakActivities = [];

    await user.save();

    res.json({
      message: 'Streak reset successfully',
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    });
  } catch (error) {
    console.error('Reset streak error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/complete-lab

router.post('/complete-lab', auth, [
  body('labId').notEmpty().withMessage('Lab ID is required'),
  body('score').isNumeric().withMessage('Score must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { labId, score } = req.body;
    const user = req.user;

    // Check if lab already completed
    const existingProgress = user.labProgress.find(p => p.labId === labId);
    if (existingProgress && existingProgress.completed) {
      return res.status(400).json({ message: 'Lab already completed' });
    }

    // Update lab progress
    if (existingProgress) {
      existingProgress.completed = true;
      existingProgress.completedAt = new Date();
      existingProgress.score = score;
    } else {
      user.labProgress.push({
        labId,
        completed: true,
        completedAt: new Date(),
        score
      });
    }

    // Update user stats
    user.completedLabs += 1;
    user.points += score;

    // Update streak for lab completion
    user.updateStreak('lab', labId);

    // Level up logic (every 1000 points = 1 level)
    const newLevel = Math.floor(user.points / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await user.save();

    // Check and award badges for lab completion
    const context = {
        type: 'lab',
        itemId: labId,
        points: score,
        isPerfectScore: score >= 100 // adjust as needed
    };
    
    // Update Skill Matrix
    const lab = await Lab.findById(labId);
    if (lab) {
        user.updateSkill(lab.category, score);
        await user.save();
    }

    const newBadges = await BadgeHelper.checkAndAwardBadges(user._id, context);
    if (newBadges.length > 0 && global.io) {
        newBadges.forEach(badge => {
            global.io.to(`user:${user._id}`).emit('badge:earned', badge);
        });
    }

    // Recalculate and broadcast everything via RealtimeHelper
    if (global.io) {
      await RealtimeHelper.broadcastUserUpdate(user._id, global.io);
    }

    // RECORD WEEKLY ACTIVITY
    const WeeklyStats = require('../models/WeeklyStats');
    await WeeklyStats.recordActivity(user._id, 'lab', score, true);

    // PREPARE UPDATED USER STATS
    const rank = await user.calculateRank();
    const userStats = {
      name: user.name,
      points: user.points,
      totalXP: user.points,
      level: user.level,
      rank: rank,
      currentStreak: user.currentStreak,
      streak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedRooms: user.completedRooms,
      completedLabs: user.completedLabs,
      isPremium: user.isPremium,
      pointsToNextLevel: user.getPointsToNextLevel()
    };

    res.json({
      message: 'Lab completed successfully',
      userStats,
      user: {
        id: user._id,
        points: user.points,
        level: user.level,
        completedLabs: user.completedLabs
      }
    });
  } catch (error) {
    console.error('Complete lab error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/delete-account
// @desc    Delete/deactivate user account
// @access  Private (user can only delete their own account)
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Deactivate account instead of permanently deleting (soft delete)
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`; // Prevent email reuse
    await user.save();

    // Clear user session
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error during account deletion' });
  }
});

module.exports = router;