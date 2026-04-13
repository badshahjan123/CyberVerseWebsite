const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lab title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: [true, 'Lab description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Lab content is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Web Security', 'Network Security', 'Cryptography', 'Forensics', 'Reverse Engineering', 'OSINT', 'Mobile Security', 'Cloud Security']
  },
  points: {
    type: Number,
    required: true,
    min: [10, 'Points must be at least 10'],
    max: [500, 'Points cannot exceed 500']
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: Number
  }],
  tags: [String],
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  prerequisites: [String],
  learningObjectives: [String],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'article', 'tool', 'documentation']
    }
  }],
  // Docker configuration
  dockerId: {
    type: String, // e.g. 'linux-forensics' — used as key in dockerManager
    trim: true
  },
  dockerImage: {
    type: String, // full image name e.g. 'cyberverseweb-main-linux-forensics-lab:latest'
    trim: true
  },
  dockerPort: {
    type: Number  // host port exposed to browser
  },
  dockerInternalPort: {
    type: Number,
    default: 7681
  },
  // Structured tasks with answers
  tasks: [{
    id: { type: Number },
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    commands: [String],
    question: { type: String },
    hint: { type: String },
    correctAnswer: { type: String }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better performance
labSchema.index({ category: 1, difficulty: 1 });
labSchema.index({ isActive: 1, isPremium: 1 });
labSchema.index({ slug: 1 });

module.exports = mongoose.model('Lab', labSchema);