const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['lab', 'room'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionTime: {
    type: Number, // in seconds
    default: 0
  },
  taskStates: [{
    taskId: String,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Index for quick lookup of user's best score
attemptSchema.index({ user: 1, itemId: 1, score: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
