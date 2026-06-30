const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  unlockReason: {
    type: String,
    required: true   // Human-readable: "Complete the Networking Fundamentals room"
  },
  category: {
    type: String,
    enum: ['room', 'milestone', 'streak', 'skill', 'special'],
    required: true
  },
  // 'primary'  → awarded on room completion (1 per room)
  // 'bonus'    → awarded only when bonusCondition is met (1 per room)
  // 'progress' → global progress badges (room count)
  // 'skill'    → threshold based skills
  // 'streak'   → consistency badges
  // 'special'  → rare/hidden achievements
  badgeType: {
    type: String,
    enum: ['primary', 'bonus', 'milestone', 'progress', 'skill', 'streak', 'special'],
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  // Only set for room badges
  roomId: {
    type: String,
    default: null
  },
  // Only set for lab badges
  labId: {
    type: String,
    default: null
  },
  // Only set for bonus badges: 'perfect_score' | 'no_hints' | 'speed'
  bonusCondition: {
    type: String,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'legendary'],
    default: 'common'
  },
  xpReward: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index: one primary + one bonus per room
badgeSchema.index({ roomId: 1, badgeType: 1 }, { sparse: true });

module.exports = mongoose.model('Badge', badgeSchema);
