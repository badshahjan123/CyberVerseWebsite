const EventEmitter = require('events');
const User = require('../models/User');
const Room = require('../models/Room');
const logger = require('../utils/logger');

// Define Badge Registry details requested by the user
const BADGES_METADATA = {
  welcome_badge: {
    name: "System Initialized",
    description: "Welcome to the arena. Your system has been initialized.",
    icon: "shield"
  },
  validated_operator: {
    name: "Validated Operator",
    description: "Successfully solved 10 tasks in the CyberVerse arena.",
    icon: "check-circle"
  },
  decompiler: {
    name: "Decompiler",
    description: "Successfully solved 50 tasks in the CyberVerse arena.",
    icon: "cpu"
  },
  flawless_execution: {
    name: "Flawless Execution",
    description: "Completed a training room with zero incorrect attempts.",
    icon: "award"
  },
  digital_detective: {
    name: "Digital Detective",
    description: "Completed 5 training rooms in the Forensics category.",
    icon: "search"
  }
};

class BadgeEventEmitter extends EventEmitter {}
const badgeEmitter = new BadgeEventEmitter();

class BadgeService {
  constructor(emitter) {
    this.emitter = emitter;
    this.registerListeners();
  }

  registerListeners() {
    this.emitter.on('USER_REGISTERED', this.handleUserRegistered.bind(this));
    this.emitter.on('TASK_SUBMITTED', this.handleTaskSubmitted.bind(this));
    this.emitter.on('ROOM_COMPLETED', this.handleRoomCompleted.bind(this));
  }

  /**
   * Safe helper to award a badge to a user document
   * @param {Object} user - User document
   * @param {string} badgeId - Key in BADGES_METADATA
   */
  async awardBadge(user, badgeId) {
    const badgeInfo = BADGES_METADATA[badgeId];
    if (!badgeInfo) {
      logger.warn(`[Badge Event Service] Unknown badge ID: ${badgeId}`);
      return false;
    }

    // Prevent duplicate badge updates
    const alreadyEarned = user.badges.some(b => b.name === badgeInfo.name);
    if (alreadyEarned) {
      return false;
    }

    user.badges.push({
      name: badgeInfo.name,
      description: badgeInfo.description,
      icon: badgeInfo.icon,
      earnedAt: new Date()
    });

    await user.save();
    logger.info(`🎉 Event-Driven Badge Awarded: "${badgeInfo.name}" to user ${user.name}`);

    // Emit live socket notification if Socket.io is initialized
    if (global.io) {
      global.io.to(`user:${user._id}`).emit("badge:earned", {
        name: badgeInfo.name,
        description: badgeInfo.description,
        icon: badgeInfo.icon,
        earnedAt: new Date()
      });
    }
    return true;
  }

  // 1. EVENT: 'USER_REGISTERED'
  async handleUserRegistered(data) {
    try {
      const { userId } = data;
      const user = await User.findById(userId);
      if (!user) return;

      await this.awardBadge(user, 'welcome_badge');
    } catch (err) {
      logger.error('[Badge Event Service] Error handling USER_REGISTERED event:', err);
    }
  }

  // 2. EVENT: 'TASK_SUBMITTED'
  async handleTaskSubmitted(data) {
    try {
      const { userId, roomId } = data;
      const user = await User.findById(userId);
      if (!user) return;

      // Calculate total correct submissions dynamically across all rooms
      let totalCorrect = 0;
      if (user.roomProgress) {
        for (const rp of user.roomProgress) {
          if (rp.exerciseAnswers) {
            for (const key of Object.keys(rp.exerciseAnswers)) {
              if (rp.exerciseAnswers[key]?.correct === true) {
                totalCorrect += 1;
              }
            }
          }
        }
      }

      // Check thresholds
      if (totalCorrect >= 10) {
        await this.awardBadge(user, 'validated_operator');
      }
      if (totalCorrect >= 50) {
        await this.awardBadge(user, 'decompiler');
      }

      // Accuracy Check for "Flawless Execution" (Legendary)
      // Check if the current room is now fully completed
      const roomProgress = user.roomProgress.find(rp => rp.roomId === roomId);
      if (roomProgress && roomProgress.completed) {
        // Find if all incorrectAttempts across all tasks in this room are 0 or undefined
        let hasIncorrectAttempts = false;
        if (roomProgress.incorrectAttempts) {
          for (const key of Object.keys(roomProgress.incorrectAttempts)) {
            if (roomProgress.incorrectAttempts[key] > 0) {
              hasIncorrectAttempts = true;
              break;
            }
          }
        }

        if (!hasIncorrectAttempts) {
          await this.awardBadge(user, 'flawless_execution');
        }
      }
    } catch (err) {
      logger.error('[Badge Event Service] Error handling TASK_SUBMITTED event:', err);
    }
  }

  // 3. EVENT: 'ROOM_COMPLETED'
  async handleRoomCompleted(data) {
    try {
      const { userId, roomId } = data;
      
      const user = await User.findById(userId);
      if (!user) return;

      // Find room in DB to check its category
      const room = await Room.findOne({ slug: roomId });
      if (!room) return;

      const completedRooms = user.roomProgress?.filter(rp => rp.completed) || [];
      const completedRoomSlugs = completedRooms.map(rp => rp.roomId);

      // Find all rooms in the database matching this category
      const sameCategoryRooms = await Room.find({ category: room.category });
      const sameCategorySlugs = sameCategoryRooms.map(r => r.slug);

      // Count completed rooms in this specific category
      const completedInCategory = completedRoomSlugs.filter(slug => sameCategorySlugs.includes(slug));

      if (completedInCategory.length >= 5) {
        // Award "Digital Detective" when user completes 5 rooms in category
        await this.awardBadge(user, 'digital_detective');
      }
    } catch (err) {
      logger.error('[Badge Event Service] Error handling ROOM_COMPLETED event:', err);
    }
  }
}

// Instantiate and start listening
const badgeService = new BadgeService(badgeEmitter);

module.exports = {
  badgeEmitter,
  badgeService
};
