const express = require('express');
const NotificationService = require('../utils/notificationService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/test-notifications/create-samples
// @desc    Create sample notifications for testing
// @access  Private
router.post('/create-samples', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Create various types of notifications
    await NotificationService.createNotification(
      userId,
      'achievement',
      'First Steps!',
      'Welcome to CyberVerse! You\'ve taken your first step into cybersecurity.',
      { data: { achievement: 'welcome' } }
    );

    await NotificationService.createNotification(
      userId,
      'level_up',
      'Level Up!',
      'Congratulations! You\'ve reached level 2!',
      { data: { level: 2 } }
    );

    await NotificationService.createNotification(
      userId,
      'streak',
      '7-Day Streak!',
      'Amazing! You\'ve maintained a 7-day learning streak!',
      { data: { streak: 7 } }
    );

    await NotificationService.createNotification(
      userId,
      'challenge',
      'New Challenge Available',
      'A new weekly challenge has been unlocked. Test your skills!',
      { data: { challenge: 'weekly-web-security' } }
    );

    await NotificationService.createNotification(
      userId,
      'system',
      'System Update',
      'New features have been added to the platform. Check them out!',
      { data: { version: '2.1.0' } }
    );

    res.json({ message: 'Sample notifications created successfully' });
  } catch (error) {
    console.error('Create sample notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/test-notifications/real-time
// @desc    Test real-time notification delivery
// @access  Private
router.post('/real-time', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'system', title, message } = req.body;
    
    const notification = await NotificationService.createNotification(
      userId,
      type,
      title || 'Real-time Test',
      message || 'This is a real-time notification test!',
      { data: { test: true, timestamp: new Date().toISOString() } }
    );

    res.json({ 
      message: 'Real-time notification sent successfully',
      notification: {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message
      }
    });
  } catch (error) {
    console.error('Real-time notification test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/test-notifications/achievement
// @desc    Test achievement notification
// @access  Private
router.post('/achievement', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { achievement = 'Test Achievement' } = req.body;
    
    await NotificationService.notifyAchievement(userId, achievement);

    res.json({ message: `Achievement notification sent: ${achievement}` });
  } catch (error) {
    console.error('Achievement notification test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/test-notifications/level-up
// @desc    Test level up notification
// @access  Private
router.post('/level-up', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { level = 5 } = req.body;
    
    await NotificationService.notifyLevelUp(userId, level);

    res.json({ message: `Level up notification sent: Level ${level}` });
  } catch (error) {
    console.error('Level up notification test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/test-notifications/streak
// @desc    Test streak notification
// @access  Private
router.post('/streak', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { streak = 7 } = req.body;
    
    await NotificationService.notifyStreak(userId, streak);

    res.json({ message: `Streak notification sent: ${streak} days` });
  } catch (error) {
    console.error('Streak notification test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;