const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function () {
      // Password only required for local authentication
      return this.authProvider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters'],
    match: [
      /^(?=.*[A-Z]).+$/,
      'Password must contain at least one uppercase letter'
    ],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    select: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumSubscription: {
    plan: String,
    startDate: Date,
    transactionId: String,
    paymentMethod: String,
    amount: String,
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    cancelledAt: Date
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  welcomeBonusGiven: {
    type: Boolean,
    default: false
  },
  completedLabs: {
    type: Number,
    default: 0
  },
  completedRooms: {
    type: Number,
    default: 0
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  labProgress: [{
    labId: String,
    completed: Boolean,
    completedAt: Date,
    score: Number
  }],
  roomProgress: [{
    roomId: String,
    joined: { type: Boolean, default: false },
    currentLecture: { type: Number, default: 0 },
    completedLectures: [Number],
    exerciseAnswers: {
      type: Object,
      default: {}
    },
    quizCompleted: { type: Boolean, default: false },
    finalScore: Number,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    totalPointsEarned: { type: Number, default: 0 },
    taskScores: [{
      taskIndex: Number,
      pointsEarned: Number,
      maxPoints: Number,
      percentage: Number
    }],
    quizScore: {
      pointsEarned: { type: Number, default: 0 },
      maxPoints: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  }],
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // 2FA Configuration
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorMethod: {
    type: String,
    enum: ['email', 'totp', 'both'],
    default: 'email'
  },
  twoFactorSecret: {
    type: String,
    select: false // Don't include in queries by default
  },
  twoFactorBackupCodes: [{
    code: String,
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // Email OTP
  emailOTP: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 }
  },

  // Device Management
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    userAgent: String,
    ipAddress: String,
    location: String,
    lastUsed: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  }],

  // Security Settings
  securitySettings: {
    requireTwoFactorOnLogin: { type: Boolean, default: false },
    requireTwoFactorOnNewDevice: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 24 * 60 * 60 * 1000 } // 24 hours
  },

  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastStreakDate: {
    type: Date,
    default: null
  },
  streakActivities: [{
    date: { type: Date, required: true },
    activityType: { type: String, enum: ['room', 'lab'], required: true },
    itemId: String
  }],

  // Badges
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Saved Items (Rooms/Labs)
  savedItems: [{
    itemType: {
      type: String,
      enum: ['room', 'lab']
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'savedItems.itemType'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate user rank
userSchema.methods.calculateRank = async function () {
  const User = this.constructor;
  const rank = await User.countDocuments({ points: { $gt: this.points } }) + 1;
  return rank;
};

// Calculate user level based on points
userSchema.methods.calculateLevel = function () {
  // Level formula: Level = floor(points / 1000) + 1
  // Level 1: 0-999 points
  // Level 2: 1000-1999 points
  // Level 3: 2000-2999 points, etc.
  return Math.floor(this.points / 1000) + 1;
};

// Get points needed for next level
userSchema.methods.getPointsToNextLevel = function () {
  const currentLevel = this.calculateLevel();
  const pointsForNextLevel = currentLevel * 1000;
  return pointsForNextLevel - this.points;
};

// Update streak based on activity
userSchema.methods.updateStreak = function (activityType, itemId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Initialize streak arrays if they don't exist
  if (!this.streakActivities) {
    this.streakActivities = [];
  }
  
  // Check if already completed activity today
  const todayActivity = this.streakActivities.find(activity => {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  });
  
  if (todayActivity) {
    return; // Already counted for today
  }
  
  // Add today's activity
  this.streakActivities.push({
    date: today,
    activityType,
    itemId
  });
  
  const lastStreakDate = this.lastStreakDate ? new Date(this.lastStreakDate) : null;
  
  if (!lastStreakDate) {
    // First activity ever
    this.currentStreak = 1;
    this.lastStreakDate = today;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastStreakDateNormalized = new Date(lastStreakDate);
    lastStreakDateNormalized.setHours(0, 0, 0, 0);
    
    if (lastStreakDateNormalized.getTime() === yesterday.getTime()) {
      // Consecutive day
      this.currentStreak = (this.currentStreak || 0) + 1;
      this.lastStreakDate = today;
    } else if (lastStreakDateNormalized.getTime() === today.getTime()) {
      // Same day (shouldn't happen due to check above)
      return;
    } else {
      // Streak broken, start new
      this.currentStreak = 1;
      this.lastStreakDate = today;
    }
  }
  
  // Update longest streak
  if (this.currentStreak > (this.longestStreak || 0)) {
    this.longestStreak = this.currentStreak;
  }
  
  console.log(`Streak updated: ${this.currentStreak}, longest: ${this.longestStreak}`);
};

// Check and update streak status
userSchema.methods.checkStreakStatus = function () {
  if (!this.lastStreakDate) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStreakDate = new Date(this.lastStreakDate);
  lastStreakDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastStreakDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1) {
    // Streak broken
    this.currentStreak = 0;
  }
};

// Update completed counts and level before saving
userSchema.pre('save', function (next) {
  // Only update if the progress arrays were modified
  if (this.isModified('roomProgress') && this.roomProgress) {
    // Only count rooms that are completed AND quiz is completed
    const uniqueCompletedRooms = this.roomProgress.filter(rp => 
      rp.completed && rp.quizCompleted && rp.roomId
    ).length;
    this.completedRooms = uniqueCompletedRooms;
  }
  if (this.isModified('labProgress') && this.labProgress) {
    const uniqueCompletedLabs = this.labProgress.filter(lp => lp.completed && lp.labId).length;
    this.completedLabs = uniqueCompletedLabs;
  }
  
  // Auto-update level based on points
  if (this.isModified('points')) {
    this.level = this.calculateLevel();
  }
  
  // Check streak status on any save
  this.checkStreakStatus();
  
  next();
});



module.exports = mongoose.model('User', userSchema);