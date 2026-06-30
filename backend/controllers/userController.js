const User = require('../models/User');
const Lab = require('../models/Lab');
const BadgeHelper = require('../utils/badgeHelper');
const RealtimeHelper = require('../utils/realtimeHelper');
const WeeklyStats = require('../models/WeeklyStats');
const path = require('path');
const fs = require('fs');

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, type = 'global', page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find()
      .select('_id name points level completedLabs completedRooms isPremium')
      .sort({ points: -1, completedRooms: -1, completedLabs: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const xpConfig = require('../utils/xpConfig');

    const leaderboard = users.map((user, index) => {
      const levelInfo = xpConfig.getLevelProgressInfo(user.points || 0);
      return {
        _id: user._id,
        rank: skip + index + 1,
        username: user.name,
        points: user.points,
        level: levelInfo.currentLevel,
        title: levelInfo.title,
        color: levelInfo.color,
        isPremium: user.isPremium
      };
    });

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const weekly = await WeeklyStats.getCurrentWeekStats(user._id);
    const rank = await user.calculateRank();

    // Cap weekly pointsEarned to user's actual total points
    const weeklyPointsEarned = Math.min(weekly.pointsEarned || 0, user.points || 0);

    // If DB has wrong value, fix it
    if (weekly.pointsEarned > user.points) {
      weekly.pointsEarned = weeklyPointsEarned;
      await weekly.save();
    }

    const xpConfig = require('../utils/xpConfig');
    const levelInfo = xpConfig.getLevelProgressInfo(user.points || 0);

    res.json({
      user: { 
        ...user.toObject(), 
        rank, 
        level: levelInfo.currentLevel,
        pointsToNextLevel: user.getPointsToNextLevel(),
        title: levelInfo.title,
        titleColor: levelInfo.color,
        nextTitle: levelInfo.nextTitle,
        nextTitleLevel: levelInfo.nextTitleLevel,
        xpProgress: levelInfo.xpProgress,
        baseXP: levelInfo.baseXP,
        nextLevelXP: levelInfo.nextLevelXP
      },
      weeklyStats: {
        labsCompleted:  weekly.labsCompleted  || 0,
        roomsCompleted: weekly.roomsCompleted || 0,
        pointsEarned:   weeklyPointsEarned,
        startRank:      weekly.startRank      || 0,
        currentRank:    weekly.currentRank    || 0,
        timeSpent:      weekly.timeSpent      || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email, avatar }, { new: true });
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload avatar
// @route   POST /api/users/upload-avatar
exports.uploadAvatar = async (req, res) => {
  // Logic for multer handling is usually in middleware or here
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const user = await User.findById(req.user.id);
  user.avatar = `/uploads/avatars/${req.file.filename}`;
  await user.save();
  res.json({ message: 'Avatar updated', avatar: user.avatar });
};
