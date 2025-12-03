const Notification = require('../models/Notification');

class NotificationService {
  static async createNotification(userId, type, title, message, options = {}) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        icon: options.icon || this.getIconForType(type),
        color: options.color || this.getColorForType(type),
        data: options.data || {}
      });

      await notification.save();
      
      // Send real-time notification via WebSocket
      this.sendRealTimeNotification(userId, notification);
      
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }

  static sendRealTimeNotification(userId, notification) {
    try {
      const io = global.io;
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          icon: notification.icon,
          color: notification.color,
          isRead: notification.isRead,
          data: notification.data,
          createdAt: notification.createdAt
        });
      }
    } catch (error) {
      console.error('Real-time notification error:', error);
    }
  }

  static getIconForType(type) {
    const icons = {
      achievement: 'trophy',
      level_up: 'zap',
      streak: 'flame',
      challenge: 'target',
      system: 'bell',
      social: 'users'
    };
    return icons[type] || 'bell';
  }

  static getColorForType(type) {
    const colors = {
      achievement: 'warning',
      level_up: 'primary',
      streak: 'success',
      challenge: 'info',
      system: 'muted',
      social: 'accent'
    };
    return colors[type] || 'primary';
  }

  static async notifyLevelUp(userId, newLevel) {
    return this.createNotification(
      userId,
      'level_up',
      'Level Up!',
      `Congratulations! You've reached level ${newLevel}!`,
      { data: { level: newLevel } }
    );
  }

  static async notifyStreak(userId, streakCount) {
    const milestones = [3, 7, 14, 30, 50, 100];
    if (milestones.includes(streakCount)) {
      return this.createNotification(
        userId,
        'streak',
        'Streak Milestone!',
        `Amazing! You've maintained a ${streakCount}-day streak!`,
        { data: { streak: streakCount } }
      );
    }
  }

  static async notifyAchievement(userId, achievement) {
    return this.createNotification(
      userId,
      'achievement',
      'Achievement Unlocked!',
      `You've earned the "${achievement}" badge!`,
      { data: { achievement } }
    );
  }

  static async notifyRoomCompletion(userId, roomName, points, isFirstTime = true) {
    if (isFirstTime) {
      return this.createNotification(
        userId,
        'challenge',
        'Room Completed!',
        `Great job! You completed "${roomName}" and earned ${points} points!`,
        { data: { roomName, points, type: 'room_completion' } }
      );
    }
  }

  static async notifyLabCompletion(userId, labName, points, isFirstTime = true) {
    if (isFirstTime) {
      return this.createNotification(
        userId,
        'challenge',
        'Lab Completed!',
        `Excellent! You completed "${labName}" and earned ${points} points!`,
        { data: { labName, points, type: 'lab_completion' } }
      );
    }
  }

  static async checkAndNotifyAchievements(userId, user) {
    const achievements = [];
    
    // First completion achievements
    if (user.completedRooms === 1 && user.completedLabs === 0) {
      achievements.push('First Steps');
    }
    if (user.completedLabs === 1 && user.completedRooms === 0) {
      achievements.push('Lab Explorer');
    }
    
    // Milestone achievements
    if (user.completedRooms === 5) achievements.push('Room Master');
    if (user.completedRooms === 10) achievements.push('Challenge Champion');
    if (user.completedLabs === 5) achievements.push('Lab Expert');
    if (user.completedLabs === 10) achievements.push('Research Scientist');
    
    // Points achievements
    if (user.points >= 1000 && user.points < 2000) achievements.push('Point Collector');
    if (user.points >= 5000 && user.points < 6000) achievements.push('Point Master');
    if (user.points >= 10000 && user.points < 11000) achievements.push('Point Legend');
    
    // Level achievements
    if (user.level === 5) achievements.push('Rising Star');
    if (user.level === 10) achievements.push('Cyber Warrior');
    if (user.level === 20) achievements.push('Security Expert');
    
    // Create notifications for new achievements
    for (const achievement of achievements) {
      const existingBadge = user.badges.find(b => b.name === achievement);
      if (!existingBadge) {
        await this.notifyAchievement(userId, achievement);
        // Add badge to user (this should be done in the calling function)
      }
    }
    
    return achievements;
  }

  static async notifyWelcome(userId, userName) {
    return this.createNotification(
      userId,
      'system',
      'Welcome to CyberVerse!',
      `Welcome ${userName}! Start your cybersecurity journey by completing your first room or lab.`,
      { data: { type: 'welcome' } }
    );
  }
}

module.exports = NotificationService;