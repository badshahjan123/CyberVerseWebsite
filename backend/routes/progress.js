const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const Lab = require('../models/Lab');
const NotificationService = require('../utils/notificationService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Update user progress after room/lab completion
router.post('/update', auth, async (req, res) => {
  try {
    const { type, itemId, points, timeSpent } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isFirstCompletion = false;
    let pointsToAdd = 0;
    let leveledUp = false;

    if (type === 'room') {
      // Check if room already completed
      const existingProgress = user.roomProgress.find(p => p.roomId === itemId);

      if (existingProgress) {
        // Room replay - update score but no additional points for completion count
        const oldScore = existingProgress.score;
        existingProgress.score = points;
        existingProgress.completedAt = new Date();

        // Only add/subtract the difference in points
        pointsToAdd = points - oldScore;
      } else {
        // First completion
        isFirstCompletion = true;
        pointsToAdd = points;
        user.completedRooms += 1;
        user.roomProgress.push({
          roomId: itemId,
          completed: true,
          completedAt: new Date(),
          score: points
        });
      }
    } else if (type === 'lab') {
      // Check if lab already completed
      const existingProgress = user.labProgress.find(p => p.labId === itemId);

      if (existingProgress) {
        // Lab replay - update score but no additional points for completion count
        const oldScore = existingProgress.score;
        existingProgress.score = points;
        existingProgress.completedAt = new Date();

        // Only add/subtract the difference in points
        pointsToAdd = points - oldScore;
      } else {
        // First completion
        isFirstCompletion = true;
        pointsToAdd = points;
        user.completedLabs += 1;
        user.labProgress.push({
          labId: itemId,
          completed: true,
          completedAt: new Date(),
          score: points
        });
      }
    }

    // Update user points and level
    const oldLevel = user.level;
    user.points += pointsToAdd;

    // Calculate new level (every 1000 points = 1 level)
    const newLevel = Math.floor(user.points / 1000) + 1;
    leveledUp = newLevel > user.level;
    user.level = newLevel;

    // Update streak for first-time completions
    if (isFirstCompletion) {
      user.updateStreak(type, itemId);
    }

    await user.save();

    // Trigger notifications for achievements
    if (isFirstCompletion) {
      try {
        // Get item details for notification
        let itemName = itemId;
        if (type === 'room') {
          const room = await Room.findOne({ slug: itemId }).select('name title');
          itemName = room ? (room.name || room.title) : itemId;
          await NotificationService.notifyRoomCompletion(userId, itemName, points, true);
        } else if (type === 'lab') {
          const lab = await Lab.findById(itemId).select('title');
          itemName = lab ? lab.title : itemId;
          await NotificationService.notifyLabCompletion(userId, itemName, points, true);
        }

        // Check for level up notification
        if (leveledUp) {
          await NotificationService.notifyLevelUp(userId, newLevel);
        }

        // Check for streak notifications
        if (user.currentStreak > 0) {
          await NotificationService.notifyStreak(userId, user.currentStreak);
        }

        // Check and notify achievements
        const newAchievements = await NotificationService.checkAndNotifyAchievements(userId, user);

        // Add new badges to user
        for (const achievement of newAchievements) {
          const existingBadge = user.badges.find(b => b.name === achievement);
          if (!existingBadge) {
            user.badges.push({
              name: achievement,
              description: getAchievementDescription(achievement),
              icon: getAchievementIcon(achievement)
            });
          }
        }

        if (newAchievements.length > 0) {
          await user.save();
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the progress update if notifications fail
      }
    }

    // Calculate new rank
    const rank = await user.calculateRank();

    // Emit real-time updates
    const io = global.io;
    if (io) {
      // Send stats update to the specific user
      io.to(`user:${userId}`).emit('user:stats:update', {
        points: user.points,
        level: user.level,
        rank,
        completedLabs: user.completedLabs,
        completedRooms: user.completedRooms,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      });

      // Broadcast leaderboard update to all users if it's a first completion
      if (isFirstCompletion) {
        const leaderboard = await User.find({ isActive: true })
          .select('name points level completedLabs completedRooms avatar')
          .sort({ points: -1, completedLabs: -1, completedRooms: -1 })
          .limit(50);

        const leaderboardWithRank = leaderboard.map((u, index) => ({
          ...u.toObject(),
          rank: index + 1
        }));

        io.emit('leaderboard:update', leaderboardWithRank);
      }
    }

    res.json({
      success: true,
      message: isFirstCompletion ? `${type} completed successfully!` : `${type} replayed successfully!`,
      data: {
        points: user.points,
        level: user.level,
        rank,
        leveledUp,
        completedLabs: user.completedLabs,
        completedRooms: user.completedRooms,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        isFirstCompletion,
        pointsAdded: pointsToAdd
      }
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get leaderboard (public endpoint)
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find({ isActive: true })
      .select('name points level completedLabs completedRooms avatar')
      .sort({ points: -1, completedLabs: -1, completedRooms: -1 })
      .limit(parseInt(limit));

    // Add rank to each user
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    res.json({
      success: true,
      data: leaderboardWithRank
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's current rank and stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name points level completedLabs completedRooms');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rank = await user.calculateRank();
    const totalUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        rank,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get completed rooms for dashboard
router.get('/completed-rooms', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const Room = require('../models/Room');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get completed room IDs - only truly completed rooms (quiz passed)
    const completedRoomIds = user.roomProgress
      .filter(p => p.completed && p.quizCompleted && p.finalScore !== undefined)
      .map(p => p.roomId);

    if (completedRoomIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Fetch room details
    const completedRooms = await Room.find({
      slug: { $in: completedRoomIds },
      isActive: true
    }).select('title slug category difficulty points coverImage short_description');

    // Merge with completion data - only show truly completed rooms
    const roomsWithProgress = completedRooms.map(room => {
      const progress = user.roomProgress.find(p => p.roomId === room.slug);
      // Only show score if room is actually completed (quiz passed)
      const actualScore = progress && progress.completed && progress.quizCompleted ?
        (progress.finalScore || progress.quizScore?.percentage || 100) : null;

      return {
        ...room.toObject(),
        completedAt: progress.completedAt,
        finalScore: actualScore,
        icon: '✅' // Completed icon
      };
    });

    res.json({
      success: true,
      data: roomsWithProgress
    });
  } catch (error) {
    console.error('Completed rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check if user has completed a specific room/lab
router.get('/check/:type/:itemId', auth, async (req, res) => {
  try {
    const { type, itemId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let completed = false;
    let score = 0;
    let completedAt = null;

    if (type === 'room') {
      const progress = user.roomProgress.find(p => p.roomId === itemId);
      if (progress) {
        completed = progress.completed;
        score = progress.score;
        completedAt = progress.completedAt;
      }
    } else if (type === 'lab') {
      const progress = user.labProgress.find(p => p.labId === itemId);
      if (progress) {
        completed = progress.completed;
        score = progress.score;
        completedAt = progress.completedAt;
      }
    }

    res.json({
      success: true,
      data: {
        completed,
        score,
        completedAt
      }
    });
  } catch (error) {
    console.error('Check completion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's completed room IDs for filtering
router.get('/completed-room-ids', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: true, data: [] });
    }

    const completedRoomIds = user.roomProgress
      .filter(p => p.completed)
      .map(p => p.roomId);

    res.json({
      success: true,
      data: completedRoomIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper functions for achievements
function getAchievementDescription(achievement) {
  const descriptions = {
    'First Steps': 'Completed your first room',
    'Lab Explorer': 'Completed your first lab',
    'Room Master': 'Completed 5 rooms',
    'Challenge Champion': 'Completed 10 rooms',
    'Lab Expert': 'Completed 5 labs',
    'Research Scientist': 'Completed 10 labs',
    'Point Collector': 'Earned 1,000 points',
    'Point Master': 'Earned 5,000 points',
    'Point Legend': 'Earned 10,000 points',
    'Rising Star': 'Reached level 5',
    'Cyber Warrior': 'Reached level 10',
    'Security Expert': 'Reached level 20'
  };
  return descriptions[achievement] || 'Special achievement unlocked';
}

function getAchievementIcon(achievement) {
  const icons = {
    'First Steps': '🚀',
    'Lab Explorer': '🔬',
    'Room Master': '🏆',
    'Challenge Champion': '👑',
    'Lab Expert': '🧪',
    'Research Scientist': '🔬',
    'Point Collector': '💎',
    'Point Master': '💰',
    'Point Legend': '🌟',
    'Rising Star': '⭐',
    'Cyber Warrior': '⚔️',
    'Security Expert': '🛡️'
  };
  return icons[achievement] || '🏅';
}

module.exports = router;